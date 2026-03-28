const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Bus = require('../models/Bus');
const Booking = require('../models/Booking');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

// @route   GET /api/admin/stats
// @desc    Get system statistics
// @access  Admin
router.get('/stats', auth, roleCheck('admin'), async (req, res) => {
  try {
    const totalStudents = await User.countDocuments({ role: 'student' });
    const totalSupervisors = await User.countDocuments({ role: 'supervisor' });
    const totalBuses = await Bus.countDocuments();
    const activeBuses = await Bus.countDocuments({ status: 'active' });
    const totalBookings = await Booking.countDocuments({ status: 'confirmed' });
    const recentBookings = await Booking.find()
      .populate('student', 'name studentId')
      .populate('bus', 'busNumber')
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({
      totalStudents,
      totalSupervisors,
      totalBuses,
      activeBuses,
      totalBookings,
      recentBookings,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/admin/users
// @desc    Get all users
// @access  Admin
router.get('/users', auth, roleCheck('admin'), async (req, res) => {
  try {
    const { role } = req.query;
    const filter = role ? { role } : {};
    const users = await User.find(filter).sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/admin/users/:id
// @desc    Delete a user
// @access  Admin
router.delete('/users/:id', auth, roleCheck('admin'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    if (user.role === 'admin') {
      return res.status(400).json({ message: 'Cannot delete admin user' });
    }

    // Cancel any active bookings
    const bookings = await Booking.find({ student: user._id, status: 'confirmed' });
    for (const booking of bookings) {
      const bus = await Bus.findById(booking.bus);
      if (bus) {
        const seat = bus.seats.find(s => s.number === booking.seatNumber);
        if (seat) {
          seat.isBooked = false;
          seat.bookedBy = null;
          seat.studentId = '';
          seat.studentName = '';
          await bus.save();
        }
      }
      booking.status = 'cancelled';
      await booking.save();
    }

    await user.deleteOne();
    res.json({ message: 'User removed successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/admin/users/:id
// @desc    Update user profile (points, role)
// @access  Admin
router.put('/users/:id', auth, roleCheck('admin'), async (req, res) => {
  try {
    const { points, role } = req.body;
    const updateData = {};
    if (points !== undefined) updateData.points = points;
    if (role !== undefined) updateData.role = role;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/admin/users/:id/assign-buses
// @desc    Assign multiple buses to a supervisor
// @access  Admin
router.post('/users/:id/assign-buses', auth, roleCheck('admin'), async (req, res) => {
  try {
    const { busIds } = req.body;
    // Unassign this supervisor from all buses first to start fresh
    await Bus.updateMany(
      { supervisors: req.params.id },
      { $pull: { supervisors: req.params.id } }
    );
    // Assign to new buses
    if (busIds && busIds.length > 0) {
      await Bus.updateMany(
        { _id: { $in: busIds } },
        { $addToSet: { supervisors: req.params.id } }
      );
    }
    res.json({ message: 'Buses assigned successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
