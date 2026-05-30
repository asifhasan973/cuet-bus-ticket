const request = require('supertest');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

// Mock db to prevent connecting to a real MongoDB
jest.mock('../config/db', () => jest.fn());

// Mock transactionHelper to run actions without a real transaction session
jest.mock('../utils/transactionHelper', () => ({
  runInTransaction: jest.fn().mockImplementation((workFn) => workFn(null)),
}));

// Helper to wrap mongoose calls to support query chaining (.session(), .populate(), etc.)
const mockQuery = (mockFn) => {
  const query = {
    session: jest.fn().mockImplementation(() => query),
    populate: jest.fn().mockImplementation(() => query),
    sort: jest.fn().mockImplementation(() => query),
    select: jest.fn().mockImplementation(() => query),
    then: (resolve, reject) => {
      return Promise.resolve(mockFn()).then(resolve, reject);
    },
    catch: (reject) => {
      return Promise.resolve(mockFn()).catch(reject);
    },
  };
  return query;
};

// In-memory data store for the test cases
let mockBookings = [];
let mockUserInstance = {
  _id: '60d5ec49f315ec001bfa8279',
  name: 'Test Student',
  email: 'test@student.cuet.ac.bd',
  role: 'student',
  points: 5,
};

const mockBusInstance = {
  _id: '60d5ec49f315ec001bfa827a',
  status: 'active',
  totalSeats: 50,
};

// Mock User Model
const mockUserFindOneAndUpdate = jest.fn().mockImplementation((query, update, options) => {
  // Enforce atomic check points > 0
  if (query.points && query.points.$gt !== undefined) {
    if (mockUserInstance.points <= 0) {
      return null; // insufficient points
    }
  }
  if (update.$inc && update.$inc.points) {
    mockUserInstance.points += update.$inc.points;
  }
  return mockUserInstance;
});

const mockUserFindById = jest.fn().mockImplementation((id) => {
  if (id === mockUserInstance._id) {
    return mockUserInstance;
  }
  return null;
});

jest.mock('../models/User', () => {
  const Model = jest.fn().mockImplementation(() => mockUserInstance);
  Model.findById = (id) => mockQuery(() => mockUserFindById(id));
  Model.findOneAndUpdate = (...args) => mockQuery(() => mockUserFindOneAndUpdate(...args));
  return Model;
});

// Mock Booking Model
const mockBookingFindOne = jest.fn().mockImplementation((query) => {
  const found = mockBookings.find((b) => {
    if (query.student && b.student !== query.student) return false;
    if (query.bus && b.bus !== query.bus) return false;
    if (query.seatNumber && b.seatNumber !== query.seatNumber) return false;
    if (query.travelDate && b.travelDate !== query.travelDate) return false;
    if (query.shift && b.shift !== query.shift) return false;
    return true;
  });
  return found || null;
});

const mockBookingSave = jest.fn().mockImplementation(function () {
  mockBookings.push(this);
  return Promise.resolve(this);
});

jest.mock('../models/Booking', () => {
  const Model = jest.fn().mockImplementation(function (data) {
    this._id = data._id || '60d5ec49f315ec001bfa827c';
    this.student = data.student;
    this.bus = data.bus;
    this.seatNumber = data.seatNumber;
    this.shift = data.shift;
    this.travelDate = data.travelDate;
    this.status = data.status || 'confirmed';
    this.isActive = data.isActive !== false;
    this.save = mockBookingSave;
    this.populate = jest.fn().mockResolvedValue(this);
    return this;
  });
  Model.findOne = (...args) => mockQuery(() => mockBookingFindOne(...args));
  Model.findById = (id) => mockQuery(() => mockBookings.find((b) => b._id === id) || null);
  return Model;
});

// Mock Bus Model
jest.mock('../models/Bus', () => {
  const Model = jest.fn();
  Model.findById = (id) =>
    mockQuery(() => {
      if (id === mockBusInstance._id) {
        return mockBusInstance;
      }
      return null;
    });
  return Model;
});

const app = require('../server');

describe('Booking Service API Tests', () => {
  let token;

  beforeAll(() => {
    process.env.JWT_SECRET = 'test_jwt_secret_must_be_long_and_secure';
    token = jwt.sign({ id: '60d5ec49f315ec001bfa8279' }, process.env.JWT_SECRET);
  });

  beforeEach(() => {
    mockBookings = [];
    mockUserInstance.points = 5;
    jest.clearAllMocks();
  });

  // TEST 1 — Duplicate booking blocked:
  // A student tries to book seat #5 on bus X for a date+shift.
  // First booking should succeed (201).
  // Second booking for the exact same seat/bus/date/shift should fail (409 or 400).
  // This tests the compound unique index works.
  it('should allow first booking but block duplicate booking for the same seat/bus/date/shift', async () => {
    const payload = {
      busId: '60d5ec49f315ec001bfa827a',
      seatNumber: 5,
      travelDate: '2026-06-01',
      shift: 1,
    };

    // First booking should succeed (201)
    const res1 = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${token}`)
      .send(payload);

    expect(res1.statusCode).toEqual(201);
    expect(res1.body.booking).toBeDefined();
    expect(res1.body.booking.seatNumber).toEqual(5);

    // Second booking for the exact same seat/bus/date/shift should fail (400 or 409)
    const res2 = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${token}`)
      .send(payload);

    expect([400, 409]).toContain(res2.statusCode);
    expect(res2.body.message).toMatch(
      /(already booked|already been booked|already have a booking)/i
    );
  });

  // TEST 2 — Zero token blocks booking:
  // A student with 0 points tries to book a seat.
  // Should return 400 with an error message.
  // This tests the atomic findOneAndUpdate condition works.
  it('should block booking when student has zero tokens (points)', async () => {
    mockUserInstance.points = 0; // zero points

    const res = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${token}`)
      .send({
        busId: '60d5ec49f315ec001bfa827a',
        seatNumber: 5,
        travelDate: '2026-06-01',
        shift: 1,
      });

    expect(res.statusCode).toEqual(400);
    expect(res.body.message).toMatch(/(Insufficient points|zero tokens)/i);
  });

  // TEST 3 — Valid booking succeeds:
  // A student with points > 0 books an available seat.
  // Should return 201 with a booking object containing: student, bus, seatNumber, status: 'confirmed'.
  it('should succeed with 201 for a valid booking', async () => {
    const res = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${token}`)
      .send({
        busId: '60d5ec49f315ec001bfa827a',
        seatNumber: 5,
        travelDate: '2026-06-01',
        shift: 1,
      });

    expect(res.statusCode).toEqual(201);
    expect(res.body.booking).toBeDefined();
    expect(res.body.booking.student).toEqual('60d5ec49f315ec001bfa8279');
    expect(res.body.booking.bus).toEqual('60d5ec49f315ec001bfa827a');
    expect(res.body.booking.seatNumber).toEqual(5);
    expect(res.body.booking.status).toEqual('confirmed');
  });

  // TEST 4 — Unauthorized booking rejected:
  // A request to POST /api/bookings with no JWT token.
  // Should return 401.
  it('should return 401 for unauthorized booking request (no JWT token)', async () => {
    const res = await request(app).post('/api/bookings').send({
      busId: '60d5ec49f315ec001bfa827a',
      seatNumber: 5,
      travelDate: '2026-06-01',
      shift: 1,
    });

    expect(res.statusCode).toEqual(401);
  });
});
