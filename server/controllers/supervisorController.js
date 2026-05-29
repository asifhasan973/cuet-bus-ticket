const supervisorService = require('../services/supervisorService');
const { validationResult } = require('express-validator');

exports.getBuses = async (req, res, next) => {
  try {
    const buses = await supervisorService.getBuses(req.user._id);
    return res.json(buses);
  } catch (error) {
    next(error);
  }
};

exports.getStudents = async (req, res, next) => {
  try {
    const { date, shift } = req.query;
    const bookings = await supervisorService.getStudents(req.params.id, date, shift);
    return res.json(bookings);
  } catch (error) {
    next(error);
  }
};

exports.markAttendance = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { bookingId, status } = req.body;
    const supervisorId = req.user._id;

    const result = await supervisorService.markAttendance({
      bookingId,
      supervisorId,
      status,
    });

    const deduction = status === 'present' ? 0 : 2;

    return res.json({
      message:
        status === 'present'
          ? 'Attendance marked as present. 0 extra tokens deducted.'
          : `Attendance marked as absent. ${deduction} penalty token(s) deducted.`,
      booking: result.booking,
      newBalance: result.newBalance,
    });
  } catch (error) {
    next(error);
  }
};

exports.markBulkAttendance = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { attendanceList } = req.body;
    const supervisorId = req.user._id;

    const results = await supervisorService.markBulkAttendance({
      attendanceList,
      supervisorId,
    });

    return res.json({
      message: 'Bulk attendance marked successfully',
      results,
    });
  } catch (error) {
    next(error);
  }
};

exports.updateRoute = async (req, res, next) => {
  try {
    const { route } = req.body;
    const busId = req.params.id;
    const supervisorId = req.user._id;

    const bus = await supervisorService.updateBusRoute({
      busId,
      supervisorId,
      route,
    });

    return res.json({
      message: 'Route updated successfully',
      bus,
    });
  } catch (error) {
    next(error);
  }
};
