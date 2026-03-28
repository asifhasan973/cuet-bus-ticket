const express = require('express');
const router = express.Router();
const Bus = require('../models/Bus');
const Booking = require('../models/Booking');
const User = require('../models/User');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

// @route   GET /api/supervisor/buses
// @desc    Get buses assigned to supervisor
// @access  Supervisor
router.get('/buses', auth, roleCheck('supervisor'), async (req, res) => {
  try {
    const buses = await Bus.find({ supervisor: req.user._id });
    // If no buses assigned, return all active buses
    const result = buses.length > 0 ? buses : await Bus.find({ status: 'active' });
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/supervisor/bus/:id/students
// @desc    Get booked students for a bus
// @access  Supervisor
router.get('/bus/:id/students', auth, roleCheck('supervisor'), async (req, res) => {
  try {
    const bookings = await Booking.find({ 
      bus: req.params.id, 
      status: 'confirmed' 
    }).populate('student', 'name email studentId department points');
    
    res.json(bookings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/supervisor/attendance
// @desc    Mark attendance and deduct tokens
// @access  Supervisor
router.post('/attendance', auth, roleCheck('supervisor'), async (req, res) => {
  try {
    const { bookingId, status } = req.body; // status: 'present' or 'absent'

    const booking = await Booking.findById(bookingId).populate('student');
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.attendance !== 'pending') {
      return res.status(400).json({ message: 'Attendance already marked for this booking' });
    }

    // Update attendance
    booking.attendance = status;
    await booking.save();

    // Deduct tokens: present = -1, absent = -3
    const deduction = status === 'present' ? 1 : 3;
    const student = await User.findById(booking.student._id);
    student.points -= deduction;
    await student.save();

    res.json({
      message: `Attendance marked as ${status}. ${deduction} token(s) deducted.`,
      booking,
      newBalance: student.points,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/supervisor/attendance/bulk
// @desc    Mark attendance for multiple students
// @access  Supervisor
router.post('/attendance/bulk', auth, roleCheck('supervisor'), async (req, res) => {
  try {
    const { attendanceList } = req.body; // [{ bookingId, status }]
    const results = [];

    for (const item of attendanceList) {
      const booking = await Booking.findById(item.bookingId).populate('student');
      if (!booking || booking.attendance !== 'pending') continue;

      booking.attendance = item.status;
      await booking.save();

      const deduction = item.status === 'present' ? 1 : 3;
      const student = await User.findById(booking.student._id);
      student.points -= deduction;
      await student.save();

      results.push({
        studentName: student.name,
        status: item.status,
        deduction,
        newBalance: student.points,
      });
    }

    res.json({ message: 'Bulk attendance marked successfully', results });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/supervisor/route/:id
// @desc    Update bus route/schedule
// @access  Supervisor
router.put('/route/:id', auth, roleCheck('supervisor'), async (req, res) => {
  try {
    const bus = await Bus.findById(req.params.id);
    if (!bus) {
      return res.status(404).json({ message: 'Bus not found' });
    }

    const { route, schedule } = req.body;
    if (route) bus.route = route;
    if (schedule) bus.schedule = schedule;

    await bus.save();
    res.json({ message: 'Route updated successfully', bus });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
