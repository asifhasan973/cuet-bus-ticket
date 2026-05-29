const express = require('express');
const router = express.Router();
const { body, param } = require('express-validator');
const bookingController = require('../controllers/bookingController');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

// @route   POST /api/bookings
// @desc    Book a seat
// @access  Student
router.post(
  '/',
  auth,
  roleCheck('student'),
  [
    body('busId', 'Bus ID is required and must be valid').isMongoId(),
    body('seatNumber', 'Seat number is required and must be an integer').isInt({ min: 1 }),
    body('travelDate', 'Travel date is required and must be in YYYY-MM-DD format').matches(
      /^\d{4}-\d{2}-\d{2}$/
    ),
    body('shift', 'Shift is required and must be between 1 and 4').isInt({ min: 1, max: 4 }),
  ],
  bookingController.create
);

// @route   GET /api/bookings/my
// @desc    Get current user's bookings
// @access  Student
router.get('/my', auth, bookingController.myBookings);

// @route   GET /api/bookings
// @desc    Get all bookings (admin)
// @access  Admin
router.get('/', auth, roleCheck('admin'), bookingController.allBookings);

// @route   DELETE /api/bookings/:id
// @desc    Cancel a booking
// @access  Student
router.delete(
  '/:id',
  auth,
  [param('id', 'Invalid booking ID format').isMongoId()],
  bookingController.cancel
);

module.exports = router;
