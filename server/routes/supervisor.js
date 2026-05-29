const express = require('express');
const router = express.Router();
const Bus = require('../models/Bus');
const Booking = require('../models/Booking');
const User = require('../models/User');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
const { body, validationResult } = require('express-validator');

// @route   GET /api/supervisor/buses
// @desc    Get buses assigned to supervisor
// @access  Supervisor
router.get('/buses', auth, roleCheck('supervisor'), async (req, res) => {
  try {
    const buses = await Bus.find({ supervisors: req.user._id });
    // If no buses assigned, return all active buses
    const result = buses.length > 0 ? buses : await Bus.find({ status: 'active' });
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/supervisor/bus/:id/students
// @desc    Get booked students for a bus (filterable by date and shift)
// @access  Supervisor
router.get('/bus/:id/students', auth, roleCheck('supervisor'), async (req, res) => {
  try {
    const { date, shift } = req.query;
    const filter = {
      bus: req.params.id,
      status: 'confirmed',
    };
    if (date) filter.travelDate = date;
    if (shift) filter.shift = parseInt(shift);

    const bookings = await Booking.find(filter).populate(
      'student',
      'name email studentId department points'
    );

    res.json(bookings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/supervisor/attendance
// @desc    Mark attendance and deduct tokens
// @access  Supervisor
router.post(
  '/attendance',
  auth,
  roleCheck('supervisor'),
  [
    body('bookingId', 'Booking ID must be a valid MongoId').isMongoId(),
    body('status', 'Status must be present or absent').isIn(['present', 'absent']),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { bookingId, status } = req.body; // status: 'present' or 'absent'

      const booking = await Booking.findById(bookingId).populate('student');
      if (!booking) {
        return res.status(404).json({ message: 'Booking not found' });
      }

      if (booking.attendance !== 'pending') {
        return res.status(400).json({ message: 'Attendance already marked for this booking' });
      }

      const bus = await Bus.findById(booking.bus);
      if (!bus.supervisors.includes(req.user._id)) {
        return res.status(403).json({ message: 'Not authorized for this bus' });
      }

      // Update attendance and complete status atomically to prevent concurrency issues (e.g. double-marking attendance points deductions)
      const updatedBooking = await Booking.findOneAndUpdate(
        { _id: bookingId, attendance: 'pending' },
        { attendance: status, status: 'completed' },
        { new: true }
      );

      if (!updatedBooking) {
        return res.status(400).json({ message: 'Attendance already marked for this booking' });
      }

      // Deduct tokens: present = 0 extra points (since 1 point was already deducted during booking)
      // absent = 2 extra penalty points (making it a total of 3 points deducted)
      const deduction = status === 'present' ? 0 : 2;
      let student = null;
      if (deduction > 0) {
        student = await User.findById(booking.student._id);
        if (student) {
          student.points = Math.max(0, student.points - deduction);
          await student.save();
        }
      } else {
        student = await User.findById(booking.student._id);
      }

      res.json({
        message:
          status === 'present'
            ? 'Attendance marked as present. 0 extra tokens deducted.'
            : `Attendance marked as absent. ${deduction} penalty token(s) deducted.`,
        booking,
        newBalance: student ? student.points : booking.student.points,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// @route   POST /api/supervisor/attendance/bulk
// @desc    Mark attendance for multiple students
// @access  Supervisor
//
// NOTE: This endpoint performs sequential DB operations per student (N+1 pattern).
// For a high-traffic production system, this should be refactored to use MongoDB
// bulkWrite() for batch updates and Promise.all() for parallel execution.
// Current approach is acceptable for the expected scale (~50 students/bus).
router.post(
  '/attendance/bulk',
  auth,
  roleCheck('supervisor'),
  [
    body('attendanceList', 'Attendance list must be an array').isArray({ min: 1 }),
    body('attendanceList.*.bookingId', 'Each booking ID must be a valid MongoId').isMongoId(),
    body('attendanceList.*.status', 'Each status must be present or absent').isIn([
      'present',
      'absent',
    ]),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { attendanceList } = req.body; // [{ bookingId, status }]
      const results = [];

      for (const item of attendanceList) {
        const booking = await Booking.findById(item.bookingId);
        if (!booking || booking.attendance !== 'pending') continue;

        const bus = await Bus.findById(booking.bus);
        if (!bus || !bus.supervisors.includes(req.user._id)) continue;

        const updatedBooking = await Booking.findOneAndUpdate(
          { _id: item.bookingId, attendance: 'pending' },
          { attendance: item.status, status: 'completed' },
          { new: true }
        ).populate('student');

        if (!updatedBooking) continue;

        const deduction = item.status === 'present' ? 0 : 2;
        const student = await User.findById(updatedBooking.student._id);
        if (student) {
          if (deduction > 0) {
            student.points = Math.max(0, student.points - deduction);
            await student.save();
          }
          results.push({
            studentName: student.name,
            status: item.status,
            deduction,
            newBalance: student.points,
          });
        }
      }

      res.json({ message: 'Bulk attendance marked successfully', results });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// @route   PUT /api/supervisor/route/:id
// @desc    Update bus route
// @access  Supervisor
router.put('/route/:id', auth, roleCheck('supervisor'), async (req, res) => {
  try {
    const bus = await Bus.findById(req.params.id);
    if (!bus) {
      return res.status(404).json({ message: 'Bus not found' });
    }

    if (!bus.supervisors.includes(req.user._id)) {
      return res.status(403).json({ message: 'Not authorized for this bus' });
    }

    const { route } = req.body;
    if (route) bus.route = route;

    await bus.save();
    res.json({ message: 'Route updated successfully', bus });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
