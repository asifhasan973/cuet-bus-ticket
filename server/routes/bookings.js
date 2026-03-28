const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const Bus = require('../models/Bus');
const User = require('../models/User');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

// @route   POST /api/bookings
// @desc    Book a seat
// @access  Student
router.post('/', auth, roleCheck('student'), async (req, res) => {
  try {
    const { busId, seatNumber } = req.body;
    const studentId = req.user._id;

    // Check if student already has a booking
    const existingBooking = await Booking.findOne({
      student: studentId,
      status: 'confirmed'
    });
    if (existingBooking) {
      return res.status(400).json({ message: 'You already have an active booking. One seat per student only.' });
    }

    // Check if student has enough points
    if (req.user.points <= 0) {
      return res.status(400).json({ message: 'Insufficient points.' });
    }

    // Find the bus and check seat availability
    const bus = await Bus.findById(busId);
    if (!bus) {
      return res.status(404).json({ message: 'Bus not found' });
    }

    const seat = bus.seats.find(s => s.number === seatNumber);
    if (!seat) {
      return res.status(400).json({ message: 'Invalid seat number' });
    }
    if (seat.isBooked) {
      return res.status(400).json({ message: 'This seat is already booked' });
    }

    // Book the seat
    seat.isBooked = true;
    seat.bookedBy = studentId;
    seat.studentId = req.user.studentId;
    seat.studentName = req.user.name;
    await bus.save();

    // Create booking record
    const booking = new Booking({
      student: studentId,
      bus: busId,
      seatNumber,
      status: 'confirmed',
    });
    await booking.save();

    // Update user's bookedSeat and deduct 1 point for booking
    await User.findByIdAndUpdate(studentId, {
      bookedSeat: { bus: busId, seatNumber },
      $inc: { points: -1 }
    });

    await booking.populate('bus', 'busNumber route');

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
      .populate('bus', 'busNumber route schedule')
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
      .populate('bus', 'busNumber route')
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

    // Free up the seat on the bus
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

    // Clear user's bookedSeat and refund 1 point
    await User.findByIdAndUpdate(booking.student, {
      bookedSeat: { bus: null, seatNumber: null },
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
