const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

// @route   GET /api/admin/analytics
// @desc    Get aggregated stats for charts
// @access  Admin
router.get('/', auth, roleCheck('admin'), async (req, res) => {
  try {
    // 1. Bookings by travel date (last 7 days of confirmed bookings)
    const bookingsByDate = await Booking.aggregate([
      { $match: { status: 'confirmed' } },
      { $group: { _id: '$travelDate', count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
      { $limit: 7 },
    ]);

    // 2. Bookings by shift
    const bookingsByShift = await Booking.aggregate([
      { $match: { status: 'confirmed' } },
      { $group: { _id: '$shift', count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);

    // 3. Bookings by bus popularity
    const bookingsByBus = await Booking.aggregate([
      { $match: { status: 'confirmed' } },
      { $group: { _id: '$bus', count: { $sum: 1 } } },
      { $lookup: { from: 'buses', localField: '_id', foreignField: '_id', as: 'busInfo' } },
      { $unwind: '$busInfo' },
      { $project: { name: '$busInfo.busName', count: 1 } },
      { $sort: { count: -1 } },
      { $limit: 5 },
    ]);

    res.json({
      bookingsByDate: bookingsByDate.map((b) => ({ date: b._id, bookings: b.count })),
      bookingsByShift: bookingsByShift.map((b) => ({ shift: b._id, bookings: b.count })),
      bookingsByBus: bookingsByBus.map((b) => ({ name: b.name, bookings: b.count })),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
