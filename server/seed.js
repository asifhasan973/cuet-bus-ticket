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
    const supervisorData = [
      { name: 'Dr. Rahman', email: 'rahman@cuet.ac.bd', employeeId: 'EMP001', department: 'CSE' },
      { name: 'Prof. Kabir', email: 'kabir@cuet.ac.bd', employeeId: 'EMP002', department: 'EEE' },
      { name: 'Dr. Hossain', email: 'hossain@cuet.ac.bd', employeeId: 'EMP003', department: 'ME' },
      { name: 'Prof. Alam', email: 'alam@cuet.ac.bd', employeeId: 'EMP004', department: 'CE' },
      { name: 'Dr. Chowdhury', email: 'chowdhury@cuet.ac.bd', employeeId: 'EMP005', department: 'URP' },
      { name: 'Prof. Uddin', email: 'uddin@cuet.ac.bd', employeeId: 'EMP006', department: 'Arch' },
    ];

    const supervisors = [];
    for (const s of supervisorData) {
      const sup = await User.create({
        ...s,
        password: 'super123',
        role: 'supervisor',
        points: 0,
      });
      supervisors.push(sup);
    }
    console.log(`✅ ${supervisors.length} Supervisors created (password: super123)`);

    // ─── Create Students ───
    const students = [];
    const mainStudent = await User.create({
      name: 'Asif Hasan', email: 'asif@student.cuet.ac.bd', studentId: '2004001', department: 'CSE', points: 47,
      password: 'student123', role: 'student',
    });
    students.push(mainStudent);
    
    for (let i = 2; i <= 500; i++) {
      const student = await User.create({
        name: `Student ${i}`, email: `student${i}@student.cuet.ac.bd`, studentId: `2004${i.toString().padStart(3, '0')}`,
        department: 'CSE', points: 50, password: 'student123', role: 'student',
      });
      students.push(student);
    }
    console.log(`✅ ${students.length} Students created (password: student123)`);

    // ─── Create 14 Buses ───
    const busesData = [
      // Flyover Buses
      {
        busName: 'Halda',
        busType: 'flyover',
        route: {
          name: 'CUET → Bahaddarhat Flyover → Lalkhan Bazar → New Market',
          stops: [
            { name: 'CUET', order: 1 },
            { name: 'Bahaddarhat Flyover', order: 2 },
            { name: 'Lalkhan Bazar', order: 3 },
            { name: 'New Market', order: 4 },
          ],
        },
        totalSeats: 50,
        supervisors: [supervisors[0]._id],
      },
      {
        busName: 'Shangu',
        busType: 'flyover',
        route: {
          name: 'CUET → Bahaddarhat Flyover → Lalkhan Bazar → New Market',
          stops: [
            { name: 'CUET', order: 1 },
            { name: 'Bahaddarhat Flyover', order: 2 },
            { name: 'Lalkhan Bazar', order: 3 },
            { name: 'New Market', order: 4 },
          ],
        },
        totalSeats: 50,
        supervisors: [supervisors[0]._id],
      },
      // Turag — unique route
      {
        busName: 'Turag',
        busType: 'regular',
        route: {
          name: 'CUET → Quaish → Oxygen → 2 No Gate → New Market → Agrabad',
          stops: [
            { name: 'CUET', order: 1 },
            { name: 'Quaish', order: 2 },
            { name: 'Oxygen', order: 3 },
            { name: '2 No Gate', order: 4 },
            { name: 'New Market', order: 5 },
            { name: 'Agrabad', order: 6 },
          ],
        },
        totalSeats: 50,
        supervisors: [supervisors[1]._id],
      },
      // Jamuna — unique route
      {
        busName: 'Jamuna',
        busType: 'regular',
        route: {
          name: 'CUET → Bahaddarhat → Chawkbazar → New Market',
          stops: [
            { name: 'CUET', order: 1 },
            { name: 'Bahaddarhat', order: 2 },
            { name: 'Chawkbazar', order: 3 },
            { name: 'New Market', order: 4 },
          ],
        },
        totalSeats: 50,
        supervisors: [supervisors[1]._id],
      },
      // Standard route buses (CUET → Bahaddarhat → GEC → Lalkhan Bazar → New Market)
      {
        busName: 'Buriganga',
        busType: 'regular',
        route: {
          name: 'CUET → Bahaddarhat → GEC → Lalkhan Bazar → New Market',
          stops: [
            { name: 'CUET', order: 1 },
            { name: 'Bahaddarhat', order: 2 },
            { name: 'GEC', order: 3 },
            { name: 'Lalkhan Bazar', order: 4 },
            { name: 'New Market', order: 5 },
          ],
        },
        totalSeats: 50,
        supervisors: [supervisors[2]._id],
      },
      {
        busName: 'Gomti',
        busType: 'regular',
        route: {
          name: 'CUET → Bahaddarhat → GEC → Lalkhan Bazar → New Market',
          stops: [
            { name: 'CUET', order: 1 },
            { name: 'Bahaddarhat', order: 2 },
            { name: 'GEC', order: 3 },
            { name: 'Lalkhan Bazar', order: 4 },
            { name: 'New Market', order: 5 },
          ],
        },
        totalSeats: 50,
        supervisors: [supervisors[2]._id],
      },
      {
        busName: 'Rupsha',
        busType: 'regular',
        route: {
          name: 'CUET → Bahaddarhat → GEC → Lalkhan Bazar → New Market',
          stops: [
            { name: 'CUET', order: 1 },
            { name: 'Bahaddarhat', order: 2 },
            { name: 'GEC', order: 3 },
            { name: 'Lalkhan Bazar', order: 4 },
            { name: 'New Market', order: 5 },
          ],
        },
        totalSeats: 50,
        supervisors: [supervisors[3]._id],
      },
      {
        busName: 'Isamoti',
        busType: 'regular',
        route: {
          name: 'CUET → Bahaddarhat → GEC → Lalkhan Bazar → New Market',
          stops: [
            { name: 'CUET', order: 1 },
            { name: 'Bahaddarhat', order: 2 },
            { name: 'GEC', order: 3 },
            { name: 'Lalkhan Bazar', order: 4 },
            { name: 'New Market', order: 5 },
          ],
        },
        totalSeats: 50,
        supervisors: [supervisors[3]._id],
      },
      {
        busName: 'Shurma',
        busType: 'regular',
        route: {
          name: 'CUET → Bahaddarhat → GEC → Lalkhan Bazar → New Market',
          stops: [
            { name: 'CUET', order: 1 },
            { name: 'Bahaddarhat', order: 2 },
            { name: 'GEC', order: 3 },
            { name: 'Lalkhan Bazar', order: 4 },
            { name: 'New Market', order: 5 },
          ],
        },
        totalSeats: 50,
        supervisors: [supervisors[4]._id],
      },
      {
        busName: 'Matamuhuri',
        busType: 'regular',
        route: {
          name: 'CUET → Bahaddarhat → GEC → Lalkhan Bazar → New Market',
          stops: [
            { name: 'CUET', order: 1 },
            { name: 'Bahaddarhat', order: 2 },
            { name: 'GEC', order: 3 },
            { name: 'Lalkhan Bazar', order: 4 },
            { name: 'New Market', order: 5 },
          ],
        },
        totalSeats: 50,
        supervisors: [supervisors[4]._id],
      },
      {
        busName: 'Tista',
        busType: 'regular',
        route: {
          name: 'CUET → Bahaddarhat → GEC → Lalkhan Bazar → New Market',
          stops: [
            { name: 'CUET', order: 1 },
            { name: 'Bahaddarhat', order: 2 },
            { name: 'GEC', order: 3 },
            { name: 'Lalkhan Bazar', order: 4 },
            { name: 'New Market', order: 5 },
          ],
        },
        totalSeats: 50,
        supervisors: [supervisors[5]._id],
      },
      {
        busName: 'Padma',
        busType: 'regular',
        route: {
          name: 'CUET → Bahaddarhat → GEC → Lalkhan Bazar → New Market',
          stops: [
            { name: 'CUET', order: 1 },
            { name: 'Bahaddarhat', order: 2 },
            { name: 'GEC', order: 3 },
            { name: 'Lalkhan Bazar', order: 4 },
            { name: 'New Market', order: 5 },
          ],
        },
        totalSeats: 50,
        supervisors: [supervisors[5]._id],
      },
      {
        busName: 'BRTC-1',
        busType: 'regular',
        route: {
          name: 'CUET → Bahaddarhat → GEC → Lalkhan Bazar → New Market',
          stops: [
            { name: 'CUET', order: 1 },
            { name: 'Bahaddarhat', order: 2 },
            { name: 'GEC', order: 3 },
            { name: 'Lalkhan Bazar', order: 4 },
            { name: 'New Market', order: 5 },
          ],
        },
        totalSeats: 50,
        supervisors: [supervisors[2]._id, supervisors[3]._id],
      },
      {
        busName: 'BRTC-2',
        busType: 'regular',
        route: {
          name: 'CUET → Bahaddarhat → GEC → Lalkhan Bazar → New Market',
          stops: [
            { name: 'CUET', order: 1 },
            { name: 'Bahaddarhat', order: 2 },
            { name: 'GEC', order: 3 },
            { name: 'Lalkhan Bazar', order: 4 },
            { name: 'New Market', order: 5 },
          ],
        },
        totalSeats: 50,
        supervisors: [supervisors[4]._id, supervisors[5]._id],
      },
    ];

    const buses = await Bus.insertMany(busesData);
    console.log(`✅ ${buses.length} Buses created`);

    // ─── Create Demo Bookings ───
    const bookingsToInsert = [];
    const today = new Date();
    
    // Create bookings for the next 3 days
    for (let dayOffset = 1; dayOffset <= 3; dayOffset++) {
      const travelDate = new Date(today);
      travelDate.setDate(today.getDate() + dayOffset);
      const travelDateStr = travelDate.toISOString().split('T')[0];
      
      const isWeekend = travelDate.getDay() === 5 || travelDate.getDay() === 6; // Fri or Sat
      const validShifts = isWeekend ? [2, 4] : [1, 2, 3, 4];
      
      for (const shift of validShifts) {
        let studentIndex = 0; // Use a different student for each seat across all buses in this shift
        for (const bus of buses) {
          // Book 26 out of 50 seats (>50%)
          for (let seat = 1; seat <= 26; seat++) {
            bookingsToInsert.push({
              student: students[studentIndex % students.length]._id,
              bus: bus._id,
              seatNumber: seat,
              shift,
              travelDate: travelDateStr,
              status: 'confirmed',
              attendance: 'pending',
            });
            studentIndex++;
          }
        }
      }
    }
    
    await Booking.insertMany(bookingsToInsert);
    console.log(`✅ ${bookingsToInsert.length} Bookings created (>50% of seats for next 3 days)`);

    console.log('\n════════════════════════════════════');
    console.log('        SEED COMPLETE! 🎉');
    console.log('════════════════════════════════════');
    console.log('\n📧 Login Credentials:');
    console.log('────────────────────────────────────');
    console.log('Admin:      admin@cuet.ac.bd      / admin123');
    console.log('Supervisor: rahman@cuet.ac.bd     / super123');
    console.log('Supervisor: kabir@cuet.ac.bd      / super123');
    console.log('Supervisor: hossain@cuet.ac.bd    / super123');
    console.log('Supervisor: alam@cuet.ac.bd       / super123');
    console.log('Supervisor: chowdhury@cuet.ac.bd  / super123');
    console.log('Supervisor: uddin@cuet.ac.bd      / super123');
    console.log('Student:    asif@student.cuet.ac.bd / student123');
    console.log('  (All 10 students share password: student123)');
    console.log('────────────────────────────────────');
    console.log('\n🚌 14 Buses: Halda, Shangu, Turag, Jamuna, Buriganga, Gomti,');
    console.log('   Rupsha, Isamoti, Shurma, Matamuhuri, Tista, Padma, BRTC-1, BRTC-2');
    console.log('🎫 Active Bookings: 7 students have booked seats');
    console.log('📋 History: 3 past completed/absent bookings\n');

    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
};

seedData();
