const mongoose = require('mongoose');

const busSchema = new mongoose.Schema({
  busName: {
    type: String,
    required: [true, 'Bus name is required'],
    unique: true,
    trim: true,
  },
  busType: {
    type: String,
    enum: ['flyover', 'regular'],
    default: 'regular',
  },
  route: {
    name: { type: String, required: true },
    stops: [{
      name: String,
      order: Number,
    }],
  },
  totalSeats: {
    type: Number,
    required: true,
    default: 50,
  },
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

busSchema.set('toJSON', { virtuals: true });
busSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Bus', busSchema);
