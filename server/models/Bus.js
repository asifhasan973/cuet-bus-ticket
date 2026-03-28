const mongoose = require('mongoose');

const seatSchema = new mongoose.Schema({
  number: {
    type: Number,
    required: true,
  },
  isBooked: {
    type: Boolean,
    default: false,
  },
  bookedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  studentId: {
    type: String,
    default: '',
  },
  studentName: {
    type: String,
    default: '',
  },
});

const busSchema = new mongoose.Schema({
  busNumber: {
    type: String,
    required: [true, 'Bus number is required'],
    unique: true,
    trim: true,
  },
  route: {
    name: { type: String, required: true },
    stops: [{ 
      name: String, 
      time: String,
      order: Number,
    }],
  },
  schedule: {
    departure: { type: String, required: true },
    arrival: { type: String, required: true },
    days: [String],
  },
  totalSeats: {
    type: Number,
    required: true,
    default: 40,
  },
  seats: [seatSchema],
  supervisors: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  status: {
    type: String,
    enum: ['active', 'inactive', 'maintenance'],
    default: 'active',
  },
}, {
  timestamps: true,
});

// Virtual for available seats count
busSchema.virtual('availableSeats').get(function() {
  if (!this.seats) return 0;
  return this.seats.filter(seat => !seat.isBooked).length;
});

busSchema.set('toJSON', { virtuals: true });
busSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Bus', busSchema);
