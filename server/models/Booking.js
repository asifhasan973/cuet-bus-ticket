const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
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
}, {
  timestamps: true,
});

module.exports = mongoose.model('Booking', bookingSchema);
