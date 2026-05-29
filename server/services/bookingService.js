const Booking = require('../models/Booking');
const Bus = require('../models/Bus');
const User = require('../models/User');
const AppError = require('../utils/appError');
const { getAvailableShifts, getShiftInfo } = require('../utils/shifts');
const { runInTransaction } = require('../utils/transactionHelper');

// Helper to convert date string (YYYY-MM-DD) and time string (e.g. '6:30 AM') to a local Date object
const parseDepartureTime = (dateStr, timeStr) => {
  const parts = timeStr.trim().split(/\s+/);
  if (parts.length < 2) return new Date(0);
  const time = parts[0];
  const modifier = parts[1].toUpperCase();

  let [hours, minutes] = time.split(':');
  hours = parseInt(hours, 10);
  minutes = parseInt(minutes, 10);

  if (modifier === 'PM' && hours < 12) {
    hours += 12;
  }
  if (modifier === 'AM' && hours === 12) {
    hours = 0;
  }

  const pad = (num) => num.toString().padStart(2, '0');
  const d = new Date(`${dateStr}T${pad(hours)}:${pad(minutes)}:00`);
  return d;
};

class BookingService {
  async createBooking({ studentId, busId, seatNumber, travelDate, shift }) {
    const shiftNum = parseInt(shift);
    if (![1, 2, 3, 4].includes(shiftNum)) {
      throw new AppError('Invalid shift number', 400);
    }

    const dateObj = new Date(`${travelDate}T00:00:00Z`);
    if (isNaN(dateObj.getTime())) {
      throw new AppError('Invalid travel date format', 400);
    }

    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    if (dateObj < today) {
      throw new AppError('Cannot book for past dates', 400);
    }

    // Validate shift is available for this date
    const availableShifts = getAvailableShifts(travelDate);
    if (!availableShifts.includes(shiftNum)) {
      throw new AppError(`Shift ${shiftNum} is not available on this date (weekend)`, 400);
    }

    // Find the bus
    const bus = await Bus.findById(busId);
    if (!bus) {
      throw new AppError('Bus not found', 404);
    }
    if (bus.status !== 'active') {
      throw new AppError('Bus is not currently active', 400);
    }

    // Check if seat valid
    if (seatNumber < 1 || seatNumber > bus.totalSeats) {
      throw new AppError('Invalid seat number', 400);
    }

    // Run transaction
    return await runInTransaction(async (session) => {
      // Check if student already has a booking for this shift + date
      const existingBooking = await Booking.findOne({
        student: studentId,
        travelDate,
        shift: shiftNum,
        isActive: true,
      }).session(session);

      if (existingBooking) {
        throw new AppError('You already have a booking for this shift on this date.', 400);
      }

      // Check if seat already booked
      const seatBooked = await Booking.findOne({
        bus: busId,
        travelDate,
        shift: shiftNum,
        seatNumber,
        isActive: true,
      }).session(session);

      if (seatBooked) {
        throw new AppError('This seat is already booked for the selected date and shift', 400);
      }

      // Deduct 1 point atomically using findOneAndUpdate with condition points > 0
      const student = await User.findOneAndUpdate(
        { _id: studentId, points: { $gt: 0 } },
        { $inc: { points: -1 } },
        { new: true, session }
      );

      if (!student) {
        throw new AppError('Insufficient points.', 400);
      }

      // Create booking record
      const booking = new Booking({
        student: studentId,
        bus: busId,
        seatNumber,
        shift: shiftNum,
        travelDate,
        status: 'confirmed',
        isActive: true,
      });

      try {
        await booking.save({ session });
      } catch (error) {
        // Fallback safety: If transactions are NOT supported by the database, session will be null.
        // In that case, we must manually refund the point to prevent point loss if booking save fails.
        if (!session) {
          await User.findByIdAndUpdate(studentId, { $inc: { points: 1 } });
        }
        throw error;
      }
      return booking;
    });
  }

  async getMyBookings(studentId) {
    return await Booking.find({ student: studentId })
      .populate('bus', 'busName route')
      .sort({ createdAt: -1 });
  }

  async getAllBookings() {
    return await Booking.find()
      .populate('student', 'name email studentId')
      .populate('bus', 'busName route')
      .sort({ createdAt: -1 });
  }

  async cancelBooking({ bookingId, userId, userRole }) {
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      throw new AppError('Booking not found', 404);
    }

    // Only the student who booked or admin can cancel
    if (booking.student.toString() !== userId.toString() && userRole !== 'admin') {
      throw new AppError('Not authorized', 403);
    }

    // Enforce 30-minute cancellation safety window (unless admin)
    if (userRole !== 'admin') {
      const shiftInfo = getShiftInfo(booking.shift, booking.travelDate);
      if (shiftInfo) {
        const departureTime = parseDepartureTime(booking.travelDate, shiftInfo.departure);
        const now = new Date();
        const timeDiffMinutes = (departureTime - now) / (1000 * 60);

        if (timeDiffMinutes < 30) {
          throw new AppError(
            'Too late to cancel. Bookings can only be cancelled up to 30 minutes before departure.',
            400
          );
        }
      }
    }

    return await runInTransaction(async (session) => {
      // Perform the atomic status update
      const updatedBooking = await Booking.findOneAndUpdate(
        { _id: bookingId, status: 'confirmed' },
        { status: 'cancelled', isActive: false },
        { new: true, session }
      );

      if (!updatedBooking) {
        throw new AppError('Booking is already cancelled or completed.', 400);
      }

      // Refund 1 point
      await User.findByIdAndUpdate(booking.student, { $inc: { points: 1 } }, { session });

      return updatedBooking;
    });
  }
}

module.exports = new BookingService();
