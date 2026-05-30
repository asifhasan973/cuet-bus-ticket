const BookingService = require('../services/bookingService');
const Booking = require('../models/Booking');
const Bus = require('../models/Bus');
const User = require('../models/User');
const AppError = require('../utils/appError');

// Mock dependencies
jest.mock('../models/Booking');
jest.mock('../models/Bus');
jest.mock('../models/User');
jest.mock('../utils/shifts', () => ({
  getAvailableShifts: jest.fn().mockReturnValue([1, 2, 3, 4]),
  getShiftInfo: jest.fn().mockReturnValue({ departure: '6:30 PM' }),
}));
jest.mock('../utils/transactionHelper', () => ({
  runInTransaction: jest.fn().mockImplementation((workFn) => workFn(null)),
}));

describe('BookingService Unit Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createBooking', () => {
    it('should throw an error for an invalid shift number', async () => {
      await expect(
        BookingService.createBooking({
          studentId: 'student_123',
          busId: 'bus_123',
          seatNumber: 5,
          travelDate: '2026-06-01',
          shift: 99, // Invalid shift
        })
      ).rejects.toThrow('Invalid shift number');
    });

    it('should throw an error for a past travel date', async () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      await expect(
        BookingService.createBooking({
          studentId: 'student_123',
          busId: 'bus_123',
          seatNumber: 5,
          travelDate: yesterdayStr,
          shift: 1,
        })
      ).rejects.toThrow('Cannot book for past dates');
    });

    it('should throw an error if the bus is not found', async () => {
      Bus.findById.mockResolvedValue(null);

      await expect(
        BookingService.createBooking({
          studentId: 'student_123',
          busId: 'non_existent_bus',
          seatNumber: 5,
          travelDate: '2026-06-30',
          shift: 1,
        })
      ).rejects.toThrow('Bus not found');
    });

    it('should throw an error if the seat number is out of bounds', async () => {
      const mockBus = { _id: 'bus_123', status: 'active', totalSeats: 40 };
      Bus.findById.mockResolvedValue(mockBus);

      await expect(
        BookingService.createBooking({
          studentId: 'student_123',
          busId: 'bus_123',
          seatNumber: 50, // Out of bounds (max 40)
          travelDate: '2026-06-30',
          shift: 1,
        })
      ).rejects.toThrow('Invalid seat number');
    });
  });

  describe('cancelBooking', () => {
    it('should throw an error if the booking does not exist', async () => {
      Booking.findById.mockResolvedValue(null);

      await expect(
        BookingService.cancelBooking({
          bookingId: 'non_existent_booking',
          userId: 'student_123',
          userRole: 'student',
        })
      ).rejects.toThrow('Booking not found');
    });

    it("should throw an error if a student tries to cancel someone else's booking", async () => {
      const mockBooking = {
        _id: 'booking_123',
        student: 'some_other_student',
        shift: 1,
        travelDate: '2026-06-30',
      };
      Booking.findById.mockResolvedValue(mockBooking);

      await expect(
        BookingService.cancelBooking({
          bookingId: 'booking_123',
          userId: 'student_123',
          userRole: 'student',
        })
      ).rejects.toThrow('Not authorized');
    });
  });
});
