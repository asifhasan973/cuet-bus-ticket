const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const Bus = require('../models/Bus');
const User = require('../models/User');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
const { getAvailableShifts, getShiftInfo } = require('../utils/shifts');
const { body, param, validationResult } = require('express-validator');

// @route   POST /api/bookings
// @desc    Book a seat
// @access  Student
router.post(
  '/',
  auth,
  roleCheck('student'),
  [
    body('busId', 'Bus ID is required and must be valid').isMongoId(),
    body('seatNumber', 'Seat number is required and must be an integer').isInt({ min: 1 }),
    body('travelDate', 'Travel date is required and must be in YYYY-MM-DD format').matches(
      /^\d{4}-\d{2}-\d{2}$/
    ),
    body('shift', 'Shift is required and must be between 1 and 4').isInt({ min: 1, max: 4 }),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { busId, seatNumber, travelDate, shift } = req.body;

      if (!travelDate) return res.status(400).json({ message: 'Travel date is required' });
      if (!shift) return res.status(400).json({ message: 'Shift is required' });

      const shiftNum = parseInt(shift);
      if (![1, 2, 3, 4].includes(shiftNum)) {
        return res.status(400).json({ message: 'Invalid shift number' });
      }

      const dateObj = new Date(`${travelDate}T00:00:00Z`);
      if (isNaN(dateObj.getTime()))
        return res.status(400).json({ message: 'Invalid travel date format' });

      const today = new Date();
      today.setUTCHours(0, 0, 0, 0);
      if (dateObj < today) {
        return res.status(400).json({ message: 'Cannot book for past dates' });
      }

      // Validate shift is available for this date (weekends only have shift 2 & 4)
      const availableShifts = getAvailableShifts(travelDate);
      if (!availableShifts.includes(shiftNum)) {
        return res
          .status(400)
          .json({ message: `Shift ${shiftNum} is not available on this date (weekend)` });
      }

      const studentId = req.user._id;

      // Find the bus
      const bus = await Bus.findById(busId);
      if (!bus) {
        return res.status(404).json({ message: 'Bus not found' });
      }
      if (bus.status !== 'active') {
        return res.status(400).json({ message: 'Bus is not currently active' });
      }

      // Check if seat valid
      if (seatNumber < 1 || seatNumber > bus.totalSeats) {
        return res.status(400).json({ message: 'Invalid seat number' });
      }

      // Check if student already has a booking for this date + shift
      const existingBooking = await Booking.findOne({
        student: studentId,
        travelDate,
        shift: shiftNum,
        isActive: true,
      });
      if (existingBooking) {
        return res
          .status(400)
          .json({ message: 'You already have a booking for this shift on this date.' });
      }

      // Check if seat already booked on this date + shift
      const seatBooked = await Booking.findOne({
        bus: busId,
        travelDate,
        shift: shiftNum,
        seatNumber,
        isActive: true,
      });
      if (seatBooked) {
        return res
          .status(400)
          .json({ message: 'This seat is already booked for the selected date and shift' });
      }

      // Deduct 1 point atomically. This guarantees that student points never go negative
      // and prevents double booking via concurrent requests.
      const student = await User.findOneAndUpdate(
        { _id: studentId, points: { $gt: 0 } },
        { $inc: { points: -1 } },
        { new: true }
      );
      if (!student) {
        return res.status(400).json({ message: 'Insufficient points.' });
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
        await booking.save();
      } catch (saveError) {
        // Refund the point atomically if saving the booking fails (e.g. unique index throws)
        await User.findByIdAndUpdate(studentId, {
          $inc: { points: 1 },
        });
        throw saveError;
      }

      await booking.populate('bus', 'busName route');

      // Emit real-time seat update via Socket.io
      const io = req.app.get('io');
      if (io) {
        io.emit('seatBooked', {
          busId,
          seatNumber,
          travelDate,
          shift: shiftNum,
          studentName: req.user.name,
          studentId: req.user.studentId,
          bookedBy: req.user._id,
        });
      }

      res.status(201).json({
        message: 'Seat booked successfully!',
        booking,
      });
    } catch (error) {
      if (error.code === 11000) {
        // Handle Mongoose duplicate key errors (concurrency safety)
        if (error.keyPattern && error.keyPattern.student) {
          return res
            .status(400)
            .json({ message: 'You already have a booking for this shift on this date.' });
        }
        return res
          .status(400)
          .json({ message: 'This seat has already been booked. Please choose another seat.' });
      }
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// @route   GET /api/bookings/my
// @desc    Get current user's bookings
// @access  Student
router.get('/my', auth, async (req, res) => {
  try {
    const bookings = await Booking.find({ student: req.user._id })
      .populate('bus', 'busName route')
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/bookings
// @desc    Get all bookings (admin)
// @access  Admin
router.get('/', auth, roleCheck('admin'), async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate('student', 'name email studentId')
      .populate('bus', 'busName route')
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

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

  // Create date string in local ISO format (YYYY-MM-DDTHH:MM:00)
  const pad = (num) => num.toString().padStart(2, '0');
  const d = new Date(`${dateStr}T${pad(hours)}:${pad(minutes)}:00`);
  return d;
};

// @route   DELETE /api/bookings/:id
// @desc    Cancel a booking
// @access  Student
router.delete(
  '/:id',
  auth,
  [param('id', 'Invalid booking ID format').isMongoId()],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const booking = await Booking.findById(req.params.id);
      if (!booking) {
        return res.status(404).json({ message: 'Booking not found' });
      }

      // Only the student who booked or admin can cancel
      if (booking.student.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Not authorized' });
      }

      // Enforce 30-minute cancellation safety window (unless requested by admin)
      if (req.user.role !== 'admin') {
        const shiftInfo = getShiftInfo(booking.shift, booking.travelDate);
        if (shiftInfo) {
          const departureTime = parseDepartureTime(booking.travelDate, shiftInfo.departure);
          const now = new Date();
          const timeDiffMinutes = (departureTime - now) / (1000 * 60);

          if (timeDiffMinutes < 30) {
            return res.status(400).json({
              message:
                'Too late to cancel. Bookings can only be cancelled up to 30 minutes before departure.',
            });
          }
        }
      }

      // Perform the atomic status update to prevent concurrent double-cancellation point duplication
      const updatedBooking = await Booking.findOneAndUpdate(
        { _id: req.params.id, status: 'confirmed' },
        { status: 'cancelled', isActive: false },
        { new: true }
      );

      if (!updatedBooking) {
        return res.status(400).json({ message: 'Booking is already cancelled or completed.' });
      }

      // Refund 1 point
      await User.findByIdAndUpdate(booking.student, {
        $inc: { points: 1 },
      });

      // Emit real-time seat update via Socket.io
      const io = req.app.get('io');
      if (io) {
        io.emit('seatCancelled', {
          busId: booking.bus,
          seatNumber: booking.seatNumber,
          travelDate: booking.travelDate,
          shift: booking.shift,
        });
      }

      res.json({ message: 'Booking cancelled successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

module.exports = router;
