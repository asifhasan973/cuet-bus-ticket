const express = require('express');
const router = express.Router();
const Bus = require('../models/Bus');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

// @route   GET /api/buses
// @desc    Get all active buses
// @access  Public
router.get('/', async (req, res) => {
  try {
    const buses = await Bus.find({ status: 'active' }).populate('supervisor', 'name email');
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
    const buses = await Bus.find().populate('supervisor', 'name email');
    res.json(buses);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/buses/:id
// @desc    Get single bus with seat details
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const bus = await Bus.findById(req.params.id).populate('supervisor', 'name email');
    if (!bus) {
      return res.status(404).json({ message: 'Bus not found' });
    }
    res.json(bus);
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
    const { busNumber, route, schedule, totalSeats, supervisor } = req.body;

    const existingBus = await Bus.findOne({ busNumber });
    if (existingBus) {
      return res.status(400).json({ message: 'Bus number already exists' });
    }

    // Generate seats array
    const seats = [];
    const seatCount = totalSeats || 40;
    for (let i = 1; i <= seatCount; i++) {
      seats.push({ number: i, isBooked: false, bookedBy: null });
    }

    const bus = new Bus({
      busNumber,
      route,
      schedule,
      totalSeats: seatCount,
      seats,
      supervisor,
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

    const { route, schedule, status, totalSeats } = req.body;
    if (route) bus.route = route;
    if (schedule) bus.schedule = schedule;
    if (status) bus.status = status;

    if (totalSeats !== undefined && req.user.role === 'admin') {
      const newTotal = parseInt(totalSeats, 10);
      if (newTotal > bus.totalSeats) {
        // Expand seats array
        for (let i = bus.totalSeats + 1; i <= newTotal; i++) {
          bus.seats.push({ number: i, isBooked: false, bookedBy: null });
        }
        bus.totalSeats = newTotal;
      } else if (newTotal < bus.totalSeats) {
        // Verify no existing bookings in the removed seats
        const hasBookingsInRemovedSeats = bus.seats
          .slice(newTotal) // from newTotal to end
          .some(s => s.isBooked);
          
        if (hasBookingsInRemovedSeats) {
           return res.status(400).json({ message: 'Cannot reduce seats: Some seats being removed are currently booked' });
        }
        // Shrink seats array
        bus.seats = bus.seats.slice(0, newTotal);
        bus.totalSeats = newTotal;
      }
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
