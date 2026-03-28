const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 6,
    select: false,
  },
  role: {
    type: String,
    enum: ['student', 'supervisor', 'admin'],
    default: 'student',
  },
  studentId: {
    type: String,
    sparse: true,
    trim: true,
  },
  employeeId: {
    type: String,
    sparse: true,
    trim: true,
  },
  department: {
    type: String,
    trim: true,
  },
  points: {
    type: Number,
    default: 0,
  },
  bookedSeat: {
    bus: { type: mongoose.Schema.Types.ObjectId, ref: 'Bus' },
    seatNumber: Number,
  },
  avatar: {
    type: String,
    default: '',
  },
}, {
  timestamps: true,
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
