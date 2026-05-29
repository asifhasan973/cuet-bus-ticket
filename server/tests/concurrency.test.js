const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryReplSet } = require('mongodb-memory-server');
const app = require('../server');
const User = require('../models/User');
const Bus = require('../models/Bus');
const Booking = require('../models/Booking');
const jwt = require('jsonwebtoken');

describe('CUETGo Concurrency & Transaction Integration Tests', () => {
  let mongoServer;
  let busId;
  let student1Token, student2Token;
  let student1Id, student2Id;

  beforeAll(async () => {
    // Spin up an in-memory MongoDB replica set
    mongoServer = await MongoMemoryReplSet.create({ replSet: { count: 1 } });
    const mongoUri = mongoServer.getUri();

    // Sever the Atlas connection imported from app to keep test data safe in-memory
    await mongoose.disconnect();
    await mongoose.connect(mongoUri);

    process.env.JWT_SECRET = 'super_secret_testing_jwt_key_of_long_length';
  }, 60000);

  afterAll(async () => {
    await mongoose.disconnect();
    if (mongoServer) {
      await mongoServer.stop();
    }
  });

  beforeEach(async () => {
    // Clear databases before running tests
    await User.deleteMany({});
    await Bus.deleteMany({});
    await Booking.deleteMany({});

    // Seed test bus
    const bus = await Bus.create({
      busName: 'Test Express',
      busType: 'regular',
      route: { name: 'CUET → GEC', stops: [{ name: 'CUET', order: 1 }] },
      totalSeats: 50,
      status: 'active',
    });
    busId = bus._id;

    // Seed 2 students with exactly 1 point balance
    const s1 = await User.create({
      name: 'Student One',
      email: 'student1@student.cuet.ac.bd',
      studentId: '1704001',
      role: 'student',
      points: 1,
      password: 'password123',
    });
    student1Id = s1._id;
    student1Token = jwt.sign({ id: s1._id }, process.env.JWT_SECRET);

    const s2 = await User.create({
      name: 'Student Two',
      email: 'student2@student.cuet.ac.bd',
      studentId: '1704002',
      role: 'student',
      points: 1,
      password: 'password123',
    });
    student2Id = s2._id;
    student2Token = jwt.sign({ id: s2._id }, process.env.JWT_SECRET);
  });

  it('should prevent double booking under rapid concurrent seat acquisition', async () => {
    // Dispatch bookings for the exact same seat at the same time
    const bookingPayload = {
      busId,
      seatNumber: 15,
      travelDate: '2026-06-01',
      shift: 2,
    };

    const results = await Promise.all([
      request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${student1Token}`)
        .send(bookingPayload),
      request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${student2Token}`)
        .send(bookingPayload),
    ]);

    const successes = results.filter((res) => res.statusCode === 201);
    const failures = results.filter((res) => res.statusCode === 400);

    // Verify exactly one student secured the seat and the other got a clean double booking failure
    expect(successes.length).toEqual(1);
    expect(failures.length).toEqual(1);
    expect(failures[0].body.message).toMatch(/already (been )?booked/i);

    // Confirm that the failing student was not charged a token (ACID rollback verify)
    const authHeader = failures[0].req.getHeader('authorization') || '';
    const failingStudentId = authHeader.includes(student1Token) ? student1Id : student2Id;
    const failingUser = await User.findById(failingStudentId);
    expect(failingUser.points).toEqual(1); // Point remains refunded
  });
});
