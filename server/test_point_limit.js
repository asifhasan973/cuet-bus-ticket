const mongoose = require('mongoose');
const User = require('./models/User');
const Booking = require('./models/Booking');
const Bus = require('./models/Bus');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const asif = await User.findOne({ email: 'asif@student.cuet.ac.bd' });

  // Clear bookings
  const bookings = await Booking.find({ student: asif._id, status: 'confirmed' });
  for (const b of bookings) {
    b.status = 'cancelled';
    await b.save();
    const bus = await Bus.findById(b.bus);
    if (bus) {
      const seat = bus.seats.find(s => s.number === b.seatNumber);
      if (seat) {
        seat.isBooked = false;
        seat.bookedBy = null;
        await bus.save();
      }
    }
  }

  // Update points and clear bookedSeat
  asif.points = -3;
  asif.bookedSeat = { bus: null, seatNumber: null };
  await asif.save();
  
  console.log('Set Asif points to -3 and cleared active bookings');
  process.exit();
});
