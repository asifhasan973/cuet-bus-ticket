const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const supervisorController = require('../controllers/supervisorController');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

// @route   GET /api/supervisor/buses
// @desc    Get buses assigned to supervisor
// @access  Supervisor
router.get('/buses', auth, roleCheck('supervisor'), supervisorController.getBuses);

// @route   GET /api/supervisor/bus/:id/students
// @desc    Get booked students for a bus (filterable by date and shift)
// @access  Supervisor
router.get('/bus/:id/students', auth, roleCheck('supervisor'), supervisorController.getStudents);

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
  supervisorController.markAttendance
);

// @route   POST /api/supervisor/attendance/bulk
// @desc    Mark attendance for multiple students
// @access  Supervisor
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
  supervisorController.markBulkAttendance
);

// @route   PUT /api/supervisor/route/:id
// @desc    Update bus route
// @access  Supervisor
router.put('/route/:id', auth, roleCheck('supervisor'), supervisorController.updateRoute);

module.exports = router;
