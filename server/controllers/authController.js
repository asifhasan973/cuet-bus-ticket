const authService = require('../services/authService');
const { validationResult } = require('express-validator');
const AppError = require('../utils/appError');

const formatUserResponse = (user) => {
  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    studentId: user.studentId,
    employeeId: user.employeeId,
    department: user.department,
    points: user.points,
    bookedSeat: user.bookedSeat,
  };
};

exports.register = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password, role, studentId, employeeId, department } = req.body;

    const result = await authService.registerUser({
      name,
      email,
      password,
      role,
      studentId,
      employeeId,
      department,
    });

    if (result.pendingApproval) {
      return res.status(201).json({
        message: result.message,
        pendingApproval: true,
      });
    }

    return res.status(201).json({
      token: result.token,
      user: formatUserResponse(result.user),
    });
  } catch (error) {
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;
    const { token, user } = await authService.loginUser({ email, password });

    return res.json({
      token,
      user: formatUserResponse(user),
    });
  } catch (error) {
    next(error);
  }
};

exports.me = async (req, res, next) => {
  try {
    const user = await authService.getCurrentUser(req.user._id);
    return res.json(user);
  } catch (error) {
    next(error);
  }
};

exports.updateProfile = async (req, res, next) => {
  try {
    const { name, department } = req.body;
    const user = await authService.updateUserProfile(req.user._id, { name, department });
    return res.json(user);
  } catch (error) {
    next(error);
  }
};

exports.googleAuth = async (req, res, next) => {
  try {
    const { credential, role } = req.body;
    if (!credential) {
      return next(new AppError('Firebase verification token is required', 400));
    }

    const { token, user } = await authService.googleAuth({ credential, role });

    return res.json({
      token,
      user: formatUserResponse(user),
    });
  } catch (error) {
    next(error);
  }
};
