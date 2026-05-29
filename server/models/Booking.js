const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    bus: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Bus',
      required: true,
    },
    seatNumber: {
      type: Number,
      required: true,
    },
    shift: {
      type: Number,
      enum: [1, 2, 3, 4],
      required: true,
    },
    travelDate: {
      type: String, // format: YYYY-MM-DD
      required: true,
    },
    status: {
      type: String,
      enum: ['confirmed', 'cancelled', 'completed'],
      default: 'confirmed',
    },
    attendance: {
      type: String,
      enum: ['pending', 'present', 'absent'],
      default: 'pending',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Optimize query performance for seat availability and booking history
bookingSchema.index({ bus: 1, travelDate: 1, shift: 1, status: 1 });
bookingSchema.index({ student: 1, travelDate: -1 });

// Concurrency safety compound unique indexes:
// 1. Prevent booking duplicate seats for the same bus + travelDate + shift
bookingSchema.index(
  { bus: 1, travelDate: 1, shift: 1, seatNumber: 1 },
  { unique: true, partialFilterExpression: { isActive: true } }
);

// 2. Prevent a student from making duplicate bookings for the same travelDate + shift
bookingSchema.index(
  { student: 1, travelDate: 1, shift: 1 },
  { unique: true, partialFilterExpression: { isActive: true } }
);

module.exports = mongoose.model('Booking', bookingSchema);
