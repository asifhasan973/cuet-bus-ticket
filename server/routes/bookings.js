const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const Bus = require('../models/Bus');
const User = require('../models/User');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
const { getAvailableShifts, getShiftInfo } = require('../utils/shifts');

// @route   POST /api/bookings
// @desc    Book a seat
// @access  Student
router.post('/', auth, roleCheck('student'), async (req, res) => {
  try {
    const { busId, seatNumber, travelDate, shift } = req.body;

    if (!travelDate) return res.status(400).json({ message: 'Travel date is required' });
    if (!shift) return res.status(400).json({ message: 'Shift is required' });

    const shiftNum = parseInt(shift);
    if (![1, 2, 3, 4].includes(shiftNum)) {
      return res.status(400).json({ message: 'Invalid shift number' });
    }

    const dateObj = new Date(`${travelDate}T00:00:00Z`);
    if (isNaN(dateObj.getTime())) return res.status(400).json({ message: 'Invalid travel date format' });

    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    if (dateObj < today) {
      return res.status(400).json({ message: 'Cannot book for past dates' });
    }

    // Validate shift is available for this date (weekends only have shift 2 & 4)
    const availableShifts = getAvailableShifts(travelDate);
    if (!availableShifts.includes(shiftNum)) {
      return res.status(400).json({ message: `Shift ${shiftNum} is not available on this date (weekend)` });
    }

    const studentId = req.user._id;

    // Check if student already has a booking for this date + shift
    const existingBooking = await Booking.findOne({
      student: studentId,
      travelDate,
      shift: shiftNum,
      status: 'confirmed'
    });
    if (existingBooking) {
      return res.status(400).json({ message: 'You already have a booking for this shift on this date.' });
    }

    // Check if student has enough points
    if (req.user.points <= 0) {
      return res.status(400).json({ message: 'Insufficient points.' });
    }

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

    // Check if seat already booked on this date + shift
    const seatBooked = await Booking.findOne({
      bus: busId,
      travelDate,
      shift: shiftNum,
      seatNumber,
      status: { $in: ['confirmed', 'completed'] }
    });
    if (seatBooked) {
      return res.status(400).json({ message: 'This seat is already booked for the selected date and shift' });
    }

    // Create booking record
    const booking = new Booking({
      student: studentId,
      bus: busId,
      seatNumber,
      shift: shiftNum,
      travelDate,
      status: 'confirmed',
    });
    await booking.save();

    // Deduct 1 point for booking
    await User.findByIdAndUpdate(studentId, {
      $inc: { points: -1 }
    });

    await booking.populate('bus', 'busName route');

    res.status(201).json({
      message: 'Seat booked successfully!',
      booking,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

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

// @route   DELETE /api/bookings/:id
// @desc    Cancel a booking
// @access  Student
router.delete('/:id', auth, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Only the student who booked or admin can cancel
    if (booking.student.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Refund 1 point
    await User.findByIdAndUpdate(booking.student, {
      $inc: { points: 1 }
    });

    booking.status = 'cancelled';
    await booking.save();

    res.json({ message: 'Booking cancelled successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
