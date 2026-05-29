const request = require('supertest');
const mongoose = require('mongoose');

// Mock connectDB to prevent connecting to database during tests
jest.mock('../config/db', () => jest.fn());

// Mock transactionHelper to bypass sessions in tests
jest.mock('../utils/transactionHelper', () => ({
  runInTransaction: jest.fn().mockImplementation((workFn) => workFn(null)),
}));

// Helper to wrap mongoose calls to support query chaining (.session(), .populate(), .sort(), .select(), etc.)
const mockQuery = (mockFn) => {
  const query = {
    session: jest.fn().mockImplementation((...args) => {
      const res = mockFn();
      if (res && typeof res.session === 'function') return res.session(...args);
      return query;
    }),
    populate: jest.fn().mockImplementation((...args) => {
      const res = mockFn();
      if (res && typeof res.populate === 'function') return res.populate(...args);
      return query;
    }),
    sort: jest.fn().mockImplementation((...args) => {
      const res = mockFn();
      if (res && typeof res.sort === 'function') return res.sort(...args);
      return query;
    }),
    select: jest.fn().mockImplementation((...args) => {
      const res = mockFn();
      if (res && typeof res.select === 'function') return res.select(...args);
      return query;
    }),
    then: (resolve, reject) => {
      const res = mockFn();
      if (res && typeof res.then === 'function') {
        return res.then(resolve, reject);
      }
      return Promise.resolve(res).then(resolve, reject);
    },
    catch: (reject) => {
      const res = mockFn();
      if (res && typeof res.catch === 'function') {
        return res.catch(reject);
      }
      return Promise.resolve(res).catch(reject);
    },
  };
  return query;
};

// Mock the User model
const mockUserInstance = {
  save: (...args) => mockUserSave(...args),
  matchPassword: jest.fn().mockResolvedValue(true),
  _id: 'mock_user_id',
  name: 'Test User',
  email: 'test@cuet.ac.bd',
  role: 'student',
  studentId: '1704001',
  points: 5,
};
const mockUserUpdateMany = jest.fn().mockResolvedValue({ modifiedCount: 5 });
const mockUserFindOne = jest.fn();
const mockUserSave = jest.fn();
const mockUserFindById = jest.fn().mockResolvedValue(mockUserInstance);
const mockUserFindByIdAndUpdate = jest.fn().mockResolvedValue(mockUserInstance);
const mockUserFindOneAndUpdate = jest.fn().mockResolvedValue(mockUserInstance);

jest.mock('../models/User', () => {
  const Model = jest.fn().mockImplementation(() => mockUserInstance);
  Model.updateMany = (...args) => mockQuery(() => mockUserUpdateMany(...args));
  Model.findOne = (...args) => mockQuery(() => mockUserFindOne(...args));
  Model.findById = (...args) => mockQuery(() => mockUserFindById(...args));
  Model.findByIdAndUpdate = (...args) => mockQuery(() => mockUserFindByIdAndUpdate(...args));
  Model.findOneAndUpdate = (...args) => mockQuery(() => mockUserFindOneAndUpdate(...args));
  return Model;
});

// Mock the Booking model
const mockBookingFindById = jest.fn();
const mockBookingFindOne = jest.fn();
const mockBookingSave = jest.fn();
const mockBookingFindOneAndUpdate = jest.fn();
jest.mock('../models/Booking', () => {
  const Model = jest.fn().mockImplementation(() => ({
    save: (...args) => mockBookingSave(...args),
    populate: jest.fn().mockResolvedValue({
      bus: { busName: 'Halda', route: { name: 'CUETRoute' } },
    }),
  }));
  Model.findById = (...args) => mockQuery(() => mockBookingFindById(...args));
  Model.findOne = (...args) => mockQuery(() => mockBookingFindOne(...args));
  Model.findOneAndUpdate = (...args) => mockQuery(() => mockBookingFindOneAndUpdate(...args));
  return Model;
});

// Mock the Bus model
const mockBusFindById = jest.fn();
jest.mock('../models/Bus', () => {
  const Model = jest.fn();
  Model.findById = (...args) => mockQuery(() => mockBusFindById(...args));
  return Model;
});

// Import app after mocks are defined
const app = require('../server');

describe('CUETGo API Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/health', () => {
    it('should return 200 and success status', async () => {
      const res = await request(app).get('/api/health');
      expect(res.statusCode).toEqual(200);
      expect(res.body).toEqual({
        status: 'ok',
        message: 'CUET Bus API is running',
      });
    });
  });

  describe('GET /api/cron/reset-points', () => {
    const originalCronSecret = process.env.CRON_SECRET;

    beforeAll(() => {
      process.env.CRON_SECRET = 'test_cron_secret';
    });

    afterAll(() => {
      process.env.CRON_SECRET = originalCronSecret;
    });

    it('should return 401 Unauthorized if authorization header is missing', async () => {
      const res = await request(app).get('/api/cron/reset-points');
      expect(res.statusCode).toEqual(401);
      expect(res.body.message).toEqual('Unauthorized');
    });

    it('should return 401 Unauthorized if token is incorrect', async () => {
      const res = await request(app)
        .get('/api/cron/reset-points')
        .set('Authorization', 'Bearer wrong_secret');
      expect(res.statusCode).toEqual(401);
      expect(res.body.message).toEqual('Unauthorized');
    });

    it('should update user points and return 200 if token is correct', async () => {
      const res = await request(app)
        .get('/api/cron/reset-points')
        .set('Authorization', 'Bearer test_cron_secret');
      
      expect(res.statusCode).toEqual(200);
      expect(res.body.message).toEqual('Points successfully allocated');
      expect(mockUserUpdateMany).toHaveBeenCalledWith(
        { role: 'student' },
        { $inc: { points: 2 } }
      );
    });
  });

  describe('POST /api/auth/login validation', () => {
    it('should return 400 validation error if email or password is missing', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: '' });
      expect(res.statusCode).toEqual(400);
      expect(res.body.errors).toBeDefined();
    });

    it('should return 403 Forbidden for non-institution email domain', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'attacker@gmail.com', password: 'password123' });
      expect(res.statusCode).toEqual(403);
      expect(res.body.message).toContain('Use a CUET email address');
    });
  });

  describe('DELETE /api/bookings/:id (Cancellation safety window)', () => {
    const jwt = require('jsonwebtoken');
    let token;

    beforeAll(() => {
      process.env.JWT_SECRET = 'test_jwt_secret';
      token = jwt.sign({ id: 'mock_user_id' }, process.env.JWT_SECRET);
    });

    it('should return 404 if booking is not found', async () => {
      mockBookingFindById.mockResolvedValue(null);

      const res = await request(app)
        .delete('/api/bookings/507f1f77bcf86cd799439011')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toEqual(404);
      expect(res.body.message).toEqual('Booking not found');
    });

    it("should return 403 if student attempts to cancel another student's booking", async () => {
      const mockBooking = {
        _id: '507f1f77bcf86cd799439011',
        student: 'some_other_user_id',
        save: jest.fn(),
      };
      mockBookingFindById.mockResolvedValue(mockBooking);

      const res = await request(app)
        .delete('/api/bookings/507f1f77bcf86cd799439011')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toEqual(403);
      expect(res.body.message).toEqual('Not authorized');
    });

    it('should return 400 if cancellation is attempted within 30 minutes of departure (past shift)', async () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      const mockBooking = {
        _id: '507f1f77bcf86cd799439011',
        student: 'mock_user_id',
        shift: 1, // Morning shift
        travelDate: yesterdayStr,
        status: 'confirmed',
        save: jest.fn().mockResolvedValue(true),
      };
      mockBookingFindById.mockResolvedValue(mockBooking);

      const res = await request(app)
        .delete('/api/bookings/507f1f77bcf86cd799439011')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toEqual(400);
      expect(res.body.message).toContain('Too late to cancel');
    });

    it('should return 200 and refund if cancellation is in the future (>30 minutes before departure)', async () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowStr = tomorrow.toISOString().split('T')[0];

      const mockBooking = {
        _id: '507f1f77bcf86cd799439011',
        student: 'mock_user_id',
        shift: 4, // Night shift
        travelDate: tomorrowStr,
        status: 'confirmed',
        save: jest.fn().mockResolvedValue(true),
      };
      mockBookingFindById.mockResolvedValue(mockBooking);
      mockBookingFindOneAndUpdate.mockResolvedValue(mockBooking);

      const res = await request(app)
        .delete('/api/bookings/507f1f77bcf86cd799439011')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.message).toEqual('Booking cancelled successfully');
      expect(mockUserFindByIdAndUpdate).toHaveBeenCalledWith(
        'mock_user_id',
        { $inc: { points: 1 } },
        expect.any(Object)
      );
    });
  });

  describe('Supervisor Approval & Registration Workflow', () => {
    it('should register student and log in immediately (return token)', async () => {
      mockUserFindOne.mockResolvedValue(null);
      mockUserSave.mockResolvedValue(true);

      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'New Student',
          email: 'newstudent@student.cuet.ac.bd',
          password: 'password123',
          role: 'student',
          studentId: '1704002',
          department: 'CSE'
        });

      expect(res.statusCode).toEqual(201);
      expect(res.body.token).toBeDefined();
      expect(res.body.user).toBeDefined();
      expect(res.body.user.role).toEqual('student');
    });

    it('should register supervisor as unapproved and not log in (return pendingApproval)', async () => {
      mockUserFindOne.mockResolvedValue(null);
      mockUserSave.mockResolvedValue(true);

      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'New Supervisor',
          email: 'newsuper@cuet.ac.bd',
          password: 'password123',
          role: 'supervisor',
          employeeId: 'EMP-999'
        });

      expect(res.statusCode).toEqual(201);
      expect(res.body.pendingApproval).toEqual(true);
      expect(res.body.message).toContain('pending administrator approval');
      expect(res.body.token).toBeUndefined();
    });

    it('should block login for unapproved supervisors (return 403)', async () => {
      const mockUnapprovedSuper = {
        _id: 'mock_super_id',
        name: 'Pending Super',
        email: 'pendingsuper@cuet.ac.bd',
        role: 'supervisor',
        isApproved: false,
        matchPassword: jest.fn().mockResolvedValue(true)
      };
      
      mockUserFindOne.mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUnapprovedSuper)
      });

      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'pendingsuper@cuet.ac.bd',
          password: 'password123'
        });

      expect(res.statusCode).toEqual(403);
      expect(res.body.message).toContain('pending admin approval');
    });
  });

  describe('POST /api/bookings (Seat booking constraints)', () => {
    const jwt = require('jsonwebtoken');
    let token;

    beforeAll(() => {
      process.env.JWT_SECRET = 'test_jwt_secret';
      token = jwt.sign({ id: 'mock_user_id' }, process.env.JWT_SECRET);
    });

    it('should return 401 if user is not authenticated', async () => {
      const res = await request(app)
        .post('/api/bookings')
        .send({
          busId: '507f1f77bcf86cd799439011',
          seatNumber: 5,
          travelDate: '2026-06-01',
          shift: 1,
        });

      expect(res.statusCode).toEqual(401);
    });

    it('should return 400 if user does not have enough points', async () => {
      mockUserInstance.points = 0; // Set points to 0
      mockBusFindById.mockResolvedValue({ _id: 'mock_bus_id', status: 'active', totalSeats: 50 });
      mockUserFindOneAndUpdate.mockResolvedValue(null); // Simulate atomic check fail

      const res = await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${token}`)
        .send({
          busId: '507f1f77bcf86cd799439011',
          seatNumber: 5,
          travelDate: '2026-06-01',
          shift: 1,
        });

      expect(res.statusCode).toEqual(400);
      expect(res.body.message).toContain('Insufficient points');
    });

    it('should return 400 if seat is already booked', async () => {
      mockUserInstance.points = 5; // Reset points
      mockUserFindOneAndUpdate.mockResolvedValue(mockUserInstance); // User has points
      mockBusFindById.mockResolvedValue({ _id: 'mock_bus_id', status: 'active', totalSeats: 50 });
      
      // Dynamic Mocking for findOne:
      mockBookingFindOne.mockImplementation((query) => {
        if (query.student) return null; // First call: check student booking (available)
        if (query.bus) return { _id: 'some_booking_id' }; // Second call: check seat booking (taken)
        return null;
      });

      const res = await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${token}`)
        .send({
          busId: '507f1f77bcf86cd799439011',
          seatNumber: 5,
          travelDate: '2026-06-01',
          shift: 1,
        });

      expect(res.statusCode).toEqual(400);
      expect(res.body.message).toContain('already booked');
    });

    it('should return 400 with duplicate message when unique index key constraint is violated', async () => {
      mockUserInstance.points = 5; // Reset points
      mockUserFindOneAndUpdate.mockResolvedValue(mockUserInstance);
      mockBusFindById.mockResolvedValue({ _id: 'mock_bus_id', status: 'active', totalSeats: 50 });
      
      // Both findOne checks pass
      mockBookingFindOne.mockResolvedValue(null);
      
      // Simulate MongoDB unique key error (code 11000)
      const duplicateError = new Error('Duplicate key');
      duplicateError.code = 11000;
      duplicateError.keyPattern = { bus: 1, travelDate: 1, shift: 1, seatNumber: 1 };
      mockBookingSave.mockRejectedValue(duplicateError);

      const res = await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${token}`)
        .send({
          busId: '507f1f77bcf86cd799439011',
          seatNumber: 5,
          travelDate: '2026-06-01',
          shift: 1,
        });

      expect(res.statusCode).toEqual(400);
      expect(res.body.message).toContain('already been booked');
    });
  });
});
