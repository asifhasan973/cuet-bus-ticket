const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Bus = require('./models/Bus');
const Booking = require('./models/Booking');

dotenv.config();

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected for seeding...');

    // Clear existing data
    await User.deleteMany({});
    await Bus.deleteMany({});
    await Booking.deleteMany({});
    console.log('Cleared existing data');

    // ─── Create Admin ───
    const admin = await User.create({
      name: 'Admin',
      email: 'admin@cuet.ac.bd',
      password: 'admin123',
      role: 'admin',
      department: 'Administration',
      points: 0,
    });
    console.log('✅ Admin: admin@cuet.ac.bd / admin123');

    // ─── Create Supervisors ───
    const supervisor1 = await User.create({
      name: 'Dr. Rahman',
      email: 'rahman@cuet.ac.bd',
      password: 'super123',
      role: 'supervisor',
      employeeId: 'EMP001',
      department: 'CSE',
      points: 0,
    });

    const supervisor2 = await User.create({
      name: 'Prof. Kabir',
      email: 'kabir@cuet.ac.bd',
      password: 'super123',
      role: 'supervisor',
      employeeId: 'EMP002',
      department: 'EEE',
      points: 0,
    });
    console.log('✅ Supervisors: rahman@cuet.ac.bd, kabir@cuet.ac.bd / super123');

    // ─── Create Students ───
    const students = [];
    const studentData = [
      { name: 'Asif Hasan', email: 'asif@student.cuet.ac.bd', studentId: '2004001', department: 'CSE', points: 47 },
      { name: 'Rafiq Islam', email: 'rafiq@student.cuet.ac.bd', studentId: '2004002', department: 'CSE', points: 50 },
      { name: 'Nadia Akter', email: 'nadia@student.cuet.ac.bd', studentId: '2004003', department: 'EEE', points: 44 },
      { name: 'Tanvir Ahmed', email: 'tanvir@student.cuet.ac.bd', studentId: '2004004', department: 'ME', points: 50 },
      { name: 'Sadia Khan', email: 'sadia@student.cuet.ac.bd', studentId: '2004005', department: 'CE', points: 48 },
      { name: 'Hasan Mahmud', email: 'hasan@student.cuet.ac.bd', studentId: '2004006', department: 'CSE', points: 45 },
      { name: 'Fatema Begum', email: 'fatema@student.cuet.ac.bd', studentId: '2004007', department: 'URP', points: 50 },
      { name: 'Kawser Rahman', email: 'kawser@student.cuet.ac.bd', studentId: '2004008', department: 'Arch', points: 46 },
      { name: 'Mim Akter', email: 'mim@student.cuet.ac.bd', studentId: '2004009', department: 'EEE', points: 50 },
      { name: 'Sakib Hossain', email: 'sakib@student.cuet.ac.bd', studentId: '2004010', department: 'PME', points: 49 },
    ];

    for (const s of studentData) {
      const student = await User.create({
        ...s,
        password: 'student123',
        role: 'student',
      });
      students.push(student);
    }
    console.log(`✅ ${students.length} Students created (password: student123)`);

    // ─── Helper: Generate Seats ───
    const generateSeats = (count) => {
      const seats = [];
      for (let i = 1; i <= count; i++) {
        seats.push({ number: i, isBooked: false, bookedBy: null, studentId: '', studentName: '' });
      }
      return seats;
    };

    // ─── Create Buses ───
    const busesData = [
      {
        busNumber: 'CUET-01',
        route: {
          name: 'Chittagong City → CUET',
          stops: [
            { name: 'GEC Circle', time: '7:00 AM', order: 1 },
            { name: 'Muradpur', time: '7:15 AM', order: 2 },
            { name: 'Oxygen', time: '7:25 AM', order: 3 },
            { name: '2 No. Gate', time: '7:35 AM', order: 4 },
            { name: 'CUET Campus', time: '7:50 AM', order: 5 },
          ],
        },
        schedule: {
          departure: '7:00 AM',
          arrival: '7:50 AM',
          days: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday'],
        },
        totalSeats: 40,
        seats: generateSeats(40),
        supervisor: supervisor1._id,
        status: 'active',
      },
      {
        busNumber: 'CUET-02',
        route: {
          name: 'Agrabad → CUET',
          stops: [
            { name: 'Agrabad', time: '7:00 AM', order: 1 },
            { name: 'Kazir Dewri', time: '7:10 AM', order: 2 },
            { name: 'Bahaddarhat', time: '7:25 AM', order: 3 },
            { name: 'Pahartali', time: '7:35 AM', order: 4 },
            { name: 'CUET Campus', time: '7:55 AM', order: 5 },
          ],
        },
        schedule: {
          departure: '7:00 AM',
          arrival: '7:55 AM',
          days: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday'],
        },
        totalSeats: 40,
        seats: generateSeats(40),
        supervisor: supervisor1._id,
        status: 'active',
      },
      {
        busNumber: 'CUET-03',
        route: {
          name: 'Hathazari → CUET',
          stops: [
            { name: 'Hathazari', time: '7:00 AM', order: 1 },
            { name: 'Fatikchhari', time: '7:20 AM', order: 2 },
            { name: 'Nazir Hat', time: '7:35 AM', order: 3 },
            { name: 'CUET Campus', time: '7:50 AM', order: 4 },
          ],
        },
        schedule: {
          departure: '7:00 AM',
          arrival: '7:50 AM',
          days: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday'],
        },
        totalSeats: 36,
        seats: generateSeats(36),
        supervisor: supervisor2._id,
        status: 'active',
      },
      {
        busNumber: 'CUET-04',
        route: {
          name: 'CUET → Chittagong City (Return)',
          stops: [
            { name: 'CUET Campus', time: '5:00 PM', order: 1 },
            { name: '2 No. Gate', time: '5:10 PM', order: 2 },
            { name: 'Oxygen', time: '5:20 PM', order: 3 },
            { name: 'Muradpur', time: '5:35 PM', order: 4 },
            { name: 'GEC Circle', time: '5:50 PM', order: 5 },
          ],
        },
        schedule: {
          departure: '5:00 PM',
          arrival: '5:50 PM',
          days: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday'],
        },
        totalSeats: 40,
        seats: generateSeats(40),
        supervisor: supervisor2._id,
        status: 'active',
      },
    ];

    const buses = await Bus.insertMany(busesData);
    console.log(`✅ ${buses.length} Buses created`);

    // ─── Create Demo Bookings (some seats booked on CUET-01 and CUET-02) ───
    const bookingPairs = [
      // Active bookings on CUET-01
      { studentIndex: 0, busIndex: 0, seat: 5, status: 'confirmed', attendance: 'pending' },
      { studentIndex: 2, busIndex: 0, seat: 12, status: 'confirmed', attendance: 'pending' },
      { studentIndex: 4, busIndex: 0, seat: 18, status: 'confirmed', attendance: 'pending' },
      { studentIndex: 5, busIndex: 0, seat: 22, status: 'confirmed', attendance: 'pending' },
      // Active bookings on CUET-02
      { studentIndex: 6, busIndex: 1, seat: 3, status: 'confirmed', attendance: 'pending' },
      { studentIndex: 7, busIndex: 1, seat: 8, status: 'confirmed', attendance: 'pending' },
      // Past completed bookings (for history)
      { studentIndex: 0, busIndex: 0, seat: 10, status: 'completed', attendance: 'present' },
      { studentIndex: 2, busIndex: 1, seat: 15, status: 'completed', attendance: 'present' },
      { studentIndex: 4, busIndex: 0, seat: 7, status: 'completed', attendance: 'absent' },
    ];

    for (const bp of bookingPairs) {
      const student = students[bp.studentIndex];
      const bus = buses[bp.busIndex];

      // Create booking
      const booking = await Booking.create({
        student: student._id,
        bus: bus._id,
        seatNumber: bp.seat,
        status: bp.status,
        attendance: bp.attendance,
      });

      // If active confirmed booking, update the seat on the bus and the student
      if (bp.status === 'confirmed') {
        const busDoc = await Bus.findById(bus._id);
        const seat = busDoc.seats.find(s => s.number === bp.seat);
        if (seat) {
          seat.isBooked = true;
          seat.bookedBy = student._id;
          seat.studentId = student.studentId;
          seat.studentName = student.name;
          await busDoc.save();
        }
        // Update student's bookedSeat
        await User.findByIdAndUpdate(student._id, {
          bookedSeat: { bus: bus._id, seatNumber: bp.seat },
        });
      }
    }
    console.log(`✅ ${bookingPairs.length} Bookings created (6 active, 3 historical)`);

    console.log('\n════════════════════════════════════');
    console.log('        SEED COMPLETE! 🎉');
    console.log('════════════════════════════════════');
    console.log('\n📧 Login Credentials:');
    console.log('────────────────────────────────────');
    console.log('Admin:      admin@cuet.ac.bd      / admin123');
    console.log('Supervisor: rahman@cuet.ac.bd     / super123');
    console.log('Supervisor: kabir@cuet.ac.bd      / super123');
    console.log('Student:    asif@student.cuet.ac.bd / student123');
    console.log('  (All 10 students share password: student123)');
    console.log('────────────────────────────────────');
    console.log('\n🚌 Buses: CUET-01, CUET-02, CUET-03, CUET-04');
    console.log('🎫 Active Bookings: 6 students have booked seats');
    console.log('📋 History: 3 past completed/absent bookings\n');

    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
};

seedData();
