const Booking = require('../models/Booking');
const Bus = require('../models/Bus');
const User = require('../models/User');
const AppError = require('../utils/appError');
const { runInTransaction } = require('../utils/transactionHelper');

class SupervisorService {
  async getBuses(supervisorId) {
    const buses = await Bus.find({ supervisors: supervisorId });
    // If no buses assigned, return all active buses
    return buses.length > 0 ? buses : await Bus.find({ status: 'active' });
  }

  async getStudents(busId, date, shift) {
    const filter = {
      bus: busId,
      status: 'confirmed',
    };
    if (date) filter.travelDate = date;
    if (shift) filter.shift = parseInt(shift);

    return await Booking.find(filter).populate(
      'student',
      'name email studentId department points'
    );
  }

  async markAttendance({ bookingId, supervisorId, status }) {
    const booking = await Booking.findById(bookingId).populate('student');
    if (!booking) {
      throw new AppError('Booking not found', 404);
    }

    if (booking.attendance !== 'pending') {
      throw new AppError('Attendance already marked for this booking', 400);
    }

    const bus = await Bus.findById(booking.bus);
    if (!bus || !bus.supervisors.includes(supervisorId)) {
      throw new AppError('Not authorized for this bus', 403);
    }

    return await runInTransaction(async (session) => {
      // Update attendance and complete status atomically inside the transaction
      const updatedBooking = await Booking.findOneAndUpdate(
        { _id: bookingId, attendance: 'pending' },
        { attendance: status, status: 'completed' },
        { new: true, session }
      );

      if (!updatedBooking) {
        throw new AppError('Attendance already marked for this booking', 400);
      }

      const deduction = status === 'present' ? 0 : 2;
      let student = await User.findById(booking.student._id).session(session);

      if (student && deduction > 0) {
        student.points = Math.max(0, student.points - deduction);
        await student.save({ session });
      }

      return {
        booking: updatedBooking,
        newBalance: student ? student.points : booking.student.points,
      };
    });
  }

  async markBulkAttendance({ attendanceList, supervisorId }) {
    const results = [];

    return await runInTransaction(async (session) => {
      for (const item of attendanceList) {
        const booking = await Booking.findById(item.bookingId).session(session);
        if (!booking || booking.attendance !== 'pending') continue;

        const bus = await Bus.findById(booking.bus).session(session);
        if (!bus || !bus.supervisors.includes(supervisorId)) continue;

        const updatedBooking = await Booking.findOneAndUpdate(
          { _id: item.bookingId, attendance: 'pending' },
          { attendance: item.status, status: 'completed' },
          { new: true, session }
        ).populate('student');

        if (!updatedBooking) continue;

        const deduction = item.status === 'present' ? 0 : 2;
        const student = await User.findById(updatedBooking.student._id).session(session);

        if (student) {
          if (deduction > 0) {
            student.points = Math.max(0, student.points - deduction);
            await student.save({ session });
          }
          results.push({
            studentName: student.name,
            status: item.status,
            deduction,
            newBalance: student.points,
          });
        }
      }

      return results;
    });
  }

  async updateBusRoute({ busId, supervisorId, route }) {
    const bus = await Bus.findById(busId);
    if (!bus) {
      throw new AppError('Bus not found', 404);
    }

    if (!bus.supervisors.includes(supervisorId)) {
      throw new AppError('Not authorized for this bus', 403);
    }

    if (route) bus.route = route;
    await bus.save();
    return bus;
  }
}

module.exports = new SupervisorService();
