const express = require('express');
const router = express.Router();
const { getAllShiftsForDate, getShiftInfo, WEEKDAY_SHIFTS, WEEKEND_SHIFTS } = require('../utils/shifts');

// @route   GET /api/shifts
// @desc    Get available shifts for a date
// @access  Public
router.get('/', (req, res) => {
  try {
    const { date } = req.query;
    if (!date) {
      return res.status(400).json({ message: 'Date query parameter is required (YYYY-MM-DD)' });
    }

    const shifts = getAllShiftsForDate(date);
    res.json(shifts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/shifts/config
// @desc    Get full shift config (weekday + weekend)
// @access  Public
router.get('/config', (req, res) => {
  res.json({
    weekday: WEEKDAY_SHIFTS,
    weekend: WEEKEND_SHIFTS,
  });
});

module.exports = router;
