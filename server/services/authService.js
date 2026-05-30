const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const AppError = require('../utils/appError');
const {
  isAllowedInstitutionEmail,
  normalizeEmail,
  ALLOWED_EMAIL_MESSAGE,
} = require('../utils/emailDomain');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// Lazy-load Firebase Admin to avoid crashes if not configured
let firebaseAdmin = null;
const getFirebaseAdmin = () => {
  if (!firebaseAdmin) {
    try {
      const admin = require('firebase-admin');
      if (!admin.apps.length) {
        let config = {};

        if (process.env.FIREBASE_SERVICE_ACCOUNT) {
          try {
            const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
            config.credential = admin.credential.cert(serviceAccount);
          } catch (e) {
            console.error('Error parsing FIREBASE_SERVICE_ACCOUNT env var:', e.message);
          }
        } else if (process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_CLIENT_EMAIL) {
          config.credential = admin.credential.cert({
            projectId: process.env.FIREBASE_PROJECT_ID || 'cuet-bus-ticket',
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
          });
        } else {
          // Fallback to Application Default Credentials or basic init
          config.projectId = process.env.FIREBASE_PROJECT_ID || 'cuet-bus-ticket';
        }

        admin.initializeApp(config);
      }
      firebaseAdmin = admin;
    } catch (err) {
      console.error('Firebase Admin init error:', err.message);
    }
  }
  return firebaseAdmin;
};

class AuthService {
  async registerUser({ name, email, password, role, studentId, employeeId, department }) {
    const normalizedEmail = normalizeEmail(email);

    if (!isAllowedInstitutionEmail(normalizedEmail)) {
      throw new AppError(ALLOWED_EMAIL_MESSAGE, 403);
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      throw new AppError('User already exists with this email', 400);
    }

    // Validate role-specific fields
    if (role === 'student' && !studentId) {
      throw new AppError('Student ID is required for students', 400);
    }
    if (role === 'supervisor' && !employeeId) {
      throw new AppError('Employee ID is required for supervisors', 400);
    }

    const isApproved = role !== 'supervisor';
    const user = new User({
      name,
      email: normalizedEmail,
      password,
      role,
      studentId: role === 'student' ? studentId : undefined,
      employeeId: role === 'supervisor' ? employeeId : undefined,
      department: role === 'student' ? department : undefined,
      points: role === 'student' ? 5 : 0,
      isApproved,
    });

    await user.save();

    if (!isApproved) {
      return {
        pendingApproval: true,
        message: 'Registration successful! Your account is pending administrator approval.',
      };
    }

    const token = generateToken(user._id);
    return { token, user };
  }

  async loginUser({ email, password }) {
    const normalizedEmail = normalizeEmail(email);

    if (!isAllowedInstitutionEmail(normalizedEmail)) {
      throw new AppError(ALLOWED_EMAIL_MESSAGE, 403);
    }

    const user = await User.findOne({ email: normalizedEmail }).select('+password');
    if (!user) {
      throw new AppError('Invalid credentials', 400);
    }

    if (user.role === 'supervisor' && !user.isApproved) {
      throw new AppError('Your supervisor account is pending admin approval.', 403);
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      throw new AppError('Invalid credentials', 400);
    }

    const token = generateToken(user._id);
    return { token, user };
  }

  async getCurrentUser(userId) {
    const user = await User.findById(userId).populate('bookedSeat.bus');
    if (!user) {
      throw new AppError('User not found', 404);
    }
    return user;
  }

  async updateUserProfile(userId, { name, department }) {
    const user = await User.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    if (name) user.name = name;
    if (department) user.department = department;

    await user.save();
    return user;
  }

  async googleAuth({ credential, role }) {
    const admin = getFirebaseAdmin();
    if (!admin) {
      throw new AppError('Firebase not configured on server', 500);
    }

    // Verify Firebase token
    let decodedToken;
    try {
      decodedToken = await admin.auth().verifyIdToken(credential);
    } catch (err) {
      throw new AppError('Google Authentication failed: ' + err.message, 401);
    }

    const { email, name, uid, email_verified: emailVerified } = decodedToken;
    const normalizedEmail = normalizeEmail(email);

    if (!email || emailVerified === false) {
      throw new AppError('Google account email must be verified', 401);
    }

    if (!isAllowedInstitutionEmail(normalizedEmail)) {
      throw new AppError(ALLOWED_EMAIL_MESSAGE, 403);
    }

    let user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      // Auto-register
      const assignedRole = ['student', 'supervisor'].includes(role) ? role : 'student';
      const studentId = assignedRole === 'student' ? normalizedEmail.split('@')[0] : undefined;
      const employeeId =
        assignedRole === 'supervisor' ? 'EMP-' + Date.now().toString().slice(-4) : undefined;
      const isApproved = assignedRole !== 'supervisor';

      user = new User({
        name: name || normalizedEmail.split('@')[0],
        email: normalizedEmail,
        password: crypto.randomBytes(32).toString('hex'),
        role: assignedRole,
        studentId,
        employeeId,
        points: assignedRole === 'student' ? 5 : 0,
        isApproved,
      });
      await user.save();
    }

    if (user.role === 'supervisor' && !user.isApproved) {
      throw new AppError('Your supervisor account is pending admin approval.', 403);
    }

    const token = generateToken(user._id);
    return { token, user };
  }
}

module.exports = new AuthService();
