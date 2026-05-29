const bookingService = require('../services/bookingService');
const { validationResult } = require('express-validator');
const AppError = require('../utils/appError');

exports.create = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { busId, seatNumber, travelDate, shift } = req.body;
    const studentId = req.user._id;

    const booking = await bookingService.createBooking({
      studentId,
      busId,
      seatNumber,
      travelDate,
      shift,
    });

    await booking.populate('bus', 'busName route');

    // Emit real-time seat update via Socket.io
    const io = req.app.get('io');
    if (io) {
      io.emit('seatBooked', {
        busId,
        seatNumber,
        travelDate,
        shift: parseInt(shift),
        studentName: req.user.name,
        studentId: req.user.studentId,
        bookedBy: req.user._id,
      });
    }

    return res.status(201).json({
      message: 'Seat booked successfully!',
      booking,
    });
  } catch (error) {
    if (error.code === 11000) {
      if (error.keyPattern && error.keyPattern.student) {
        return next(new AppError('You already have a booking for this shift on this date.', 400));
      }
      return next(
        new AppError('This seat has already been booked. Please choose another seat.', 400)
      );
    }
    next(error);
  }
};

exports.myBookings = async (req, res, next) => {
  try {
    const bookings = await bookingService.getMyBookings(req.user._id);
    return res.json(bookings);
  } catch (error) {
    next(error);
  }
};

exports.allBookings = async (req, res, next) => {
  try {
    const bookings = await bookingService.getAllBookings();
    return res.json(bookings);
  } catch (error) {
    next(error);
  }
};

exports.cancel = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const bookingId = req.params.id;
    const userId = req.user._id;
    const userRole = req.user.role;

    const updatedBooking = await bookingService.cancelBooking({
      bookingId,
      userId,
      userRole,
    });

    // Emit real-time seat update via Socket.io
    const io = req.app.get('io');
    if (io) {
      io.emit('seatCancelled', {
        busId: updatedBooking.bus,
        seatNumber: updatedBooking.seatNumber,
        travelDate: updatedBooking.travelDate,
        shift: updatedBooking.shift,
      });
    }

    return res.json({ message: 'Booking cancelled successfully' });
  } catch (error) {
    next(error);
  }
};
