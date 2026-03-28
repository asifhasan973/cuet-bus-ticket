const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const auth = require('../middleware/auth');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// Lazy-load firebase admin to avoid crashes if not configured
let firebaseAdmin = null;
const getFirebaseAdmin = () => {
  if (!firebaseAdmin) {
    try {
      const admin = require('firebase-admin');
      if (!admin.apps.length) {
        admin.initializeApp({
          projectId: 'cuet-bus-ticket'
        });
      }
      firebaseAdmin = admin;
    } catch (err) {
      console.error('Firebase Admin init error:', err.message);
    }
  }
  return firebaseAdmin;
};

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', [
  body('name', 'Name is required').notEmpty(),
  body('email', 'Please include a valid email').isEmail(),
  body('password', 'Password must be at least 6 characters').isLength({ min: 6 }),
  body('role', 'Role must be student or supervisor').isIn(['student', 'supervisor']),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password, role, studentId, employeeId, department } = req.body;

    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Validate role-specific fields
    if (role === 'student' && !studentId) {
      return res.status(400).json({ message: 'Student ID is required for students' });
    }
    if (role === 'supervisor' && !employeeId) {
      return res.status(400).json({ message: 'Employee ID is required for supervisors' });
    }

    user = new User({
      name,
      email,
      password,
      role,
      studentId: role === 'student' ? studentId : undefined,
      employeeId: role === 'supervisor' ? employeeId : undefined,
      department,
      points: role === 'student' ? 5 : 0,
    });

    await user.save();

    const token = generateToken(user._id);

    res.status(201).json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        studentId: user.studentId,
        employeeId: user.employeeId,
        department: user.department,
        points: user.points,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', [
  body('email', 'Please include a valid email').isEmail(),
  body('password', 'Password is required').notEmpty(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = generateToken(user._id);

    res.json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        studentId: user.studentId,
        employeeId: user.employeeId,
        department: user.department,
        points: user.points,
        bookedSeat: user.bookedSeat,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('bookedSeat.bus');
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/auth/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', auth, async (req, res) => {
  try {
    const { name, department } = req.body;
    const user = await User.findById(req.user._id);

    if (name) user.name = name;
    if (department) user.department = department;

    await user.save();
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/auth/google
// @desc    Google Login/Register via Firebase
// @access  Public
router.post('/google', async (req, res) => {
  try {
    const { credential, role } = req.body;
    
    const admin = getFirebaseAdmin();
    if (!admin) {
      return res.status(500).json({ message: 'Firebase not configured on server' });
    }

    // Verify Firebase token
    const decodedToken = await admin.auth().verifyIdToken(credential);
    const { email, name, uid } = decodedToken;
    
    let user = await User.findOne({ email });
    
    if (!user) {
      // Auto-register
      const assignedRole = role || 'student';
      const studentId = assignedRole === 'student' ? email.split('@')[0] : undefined;
      const employeeId = assignedRole === 'supervisor' ? 'EMP-' + Date.now().toString().slice(-4) : undefined;
      
      user = new User({
        name: name || email.split('@')[0],
        email,
        password: uid, // Use Firebase UID as random password
        role: assignedRole,
        studentId,
        employeeId,
        points: assignedRole === 'student' ? 5 : 0,
      });
      await user.save();
    }
    
    const token = generateToken(user._id);
    
    res.json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        studentId: user.studentId,
        employeeId: user.employeeId,
        department: user.department,
        points: user.points,
        bookedSeat: user.bookedSeat,
      },
    });
  } catch (error) {
    console.error('Google Auth Error:', error.message);
    res.status(401).json({ message: 'Google Authentication failed' });
  }
});

module.exports = router;
