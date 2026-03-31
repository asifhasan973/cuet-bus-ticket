const express = require('express');
const router = express.Router();
const Bus = require('../models/Bus');
const Booking = require('../models/Booking');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
const { getShiftInfo, getAvailableShifts } = require('../utils/shifts');

// @route   GET /api/buses
// @desc    Get all active buses with optional available seats count
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { date, shift } = req.query;
    let buses = await Bus.find({ status: 'active' }).populate('supervisors', 'name email');

    if (date && shift) {
      const bookings = await Booking.find({
        travelDate: date,
        shift: parseInt(shift),
        status: { $in: ['confirmed', 'completed'] }
      });
      
      const bookingsByBus = {};
      bookings.forEach(b => {
        bookingsByBus[b.bus] = (bookingsByBus[b.bus] || 0) + 1;
      });
      
      buses = buses.map(bus => {
        const busObj = bus.toObject();
        const booked = bookingsByBus[bus._id] || 0;
        busObj.availableSeats = bus.totalSeats - booked;
        return busObj;
      });
    }

    res.json(buses);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/buses/all
// @desc    Get ALL buses (admin)
// @access  Admin
router.get('/all', auth, roleCheck('admin'), async (req, res) => {
  try {
    const buses = await Bus.find().populate('supervisors', 'name email');
    res.json(buses);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/buses/:id
// @desc    Get single bus with dynamically populated seat map for date+shift
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const { date, shift } = req.query; // date: YYYY-MM-DD, shift: 1-4

    const bus = await Bus.findById(req.params.id).populate('supervisors', 'name email');
    if (!bus) {
      return res.status(404).json({ message: 'Bus not found' });
    }

    // Generate static physical seats outline
    const seats = [];
    for (let i = 1; i <= bus.totalSeats; i++) {
      seats.push({ number: i, isBooked: false, bookedBy: null, studentId: '', studentName: '' });
    }

    // Populate actual booked seats if date and shift provided
    if (date && shift) {
      const bookings = await Booking.find({
        bus: bus._id,
        travelDate: date,
        shift: parseInt(shift),
        status: { $in: ['confirmed', 'completed'] }
      }).populate('student', 'name studentId');

      bookings.forEach(b => {
        const seatIndex = b.seatNumber - 1;
        if (seats[seatIndex]) {
          seats[seatIndex].isBooked = true;
          seats[seatIndex].bookedBy = b.student._id;
          seats[seatIndex].studentId = b.student.studentId;
          seats[seatIndex].studentName = b.student.name;
        }
      });
    }

    const busObj = bus.toObject();
    busObj.seats = seats;
    busObj.availableSeats = seats.filter(s => !s.isBooked).length;

    // Attach shift info if provided
    if (date && shift) {
      const shiftInfo = getShiftInfo(parseInt(shift), date);
      busObj.shiftInfo = shiftInfo;
    }

    res.json(busObj);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/buses
// @desc    Create a new bus
// @access  Admin
router.post('/', auth, roleCheck('admin'), async (req, res) => {
  try {
    const { busName, busType, route, totalSeats, supervisors } = req.body;

    const existingBus = await Bus.findOne({ busName });
    if (existingBus) {
      return res.status(400).json({ message: 'Bus name already exists' });
    }

    const bus = new Bus({
      busName,
      busType: busType || 'regular',
      route,
      totalSeats: totalSeats || 50,
      supervisors,
    });

    await bus.save();
    res.status(201).json(bus);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/buses/:id
// @desc    Update bus info
// @access  Admin/Supervisor
router.put('/:id', auth, roleCheck('admin', 'supervisor'), async (req, res) => {
  try {
    const bus = await Bus.findById(req.params.id);
    if (!bus) {
      return res.status(404).json({ message: 'Bus not found' });
    }

    const { busName, busType, route, status, totalSeats, supervisors } = req.body;

    if (busName && busName !== bus.busName && req.user.role === 'admin') {
      const existingBus = await Bus.findOne({ busName });
      if (existingBus && existingBus._id.toString() !== req.params.id) {
        return res.status(400).json({ message: 'Bus name already exists' });
      }
      bus.busName = busName;
    }

    if (busType && req.user.role === 'admin') bus.busType = busType;
    if (route) bus.route = route;
    if (status) bus.status = status;
    if (supervisors && req.user.role === 'admin') bus.supervisors = supervisors;

    if (totalSeats !== undefined && req.user.role === 'admin') {
      bus.totalSeats = parseInt(totalSeats, 10);
    }

    await bus.save();
    res.json(bus);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/buses/:id
// @desc    Delete a bus
// @access  Admin
router.delete('/:id', auth, roleCheck('admin'), async (req, res) => {
  try {
    const bus = await Bus.findById(req.params.id);
    if (!bus) {
      return res.status(404).json({ message: 'Bus not found' });
    }
    await bus.deleteOne();
    res.json({ message: 'Bus removed' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
