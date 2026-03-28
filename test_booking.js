const axios = require('axios');
const mongoose = require('mongoose');

async function testBooking() {
  try {
    const api = axios.create({ baseURL: 'http://localhost:5001/api' });

    console.log('Registering student...');
    let studentToken;
    try {
      const res = await api.post('/auth/register', {
        name: 'Test Student',
        email: 'test_student@cuet.ac.bd',
        password: 'password123',
        role: 'student',
        studentId: '1904001'
      });
      studentToken = res.data.token;
    } catch(err) {
      if(err.response?.data?.message === 'User already exists') {
        const res = await api.post('/auth/login', {
          email: 'test_student@cuet.ac.bd',
          password: 'password123'
        });
        studentToken = res.data.token;
      } else {
        throw err;
      }
    }

    console.log('Registering admin...');
    let adminToken;
    try {
      const res = await api.post('/auth/register', {
        name: 'Test Admin',
        email: 'test_admin@cuet.ac.bd',
        password: 'password123',
        role: 'admin'
      });
      adminToken = res.data.token;
    } catch(err) {
      if(err.response?.data?.message === 'User already exists') {
        const res = await api.post('/auth/login', {
          email: 'test_admin@cuet.ac.bd',
          password: 'password123'
        });
        adminToken = res.data.token;
      } else {
        throw err;
      }
    }

    console.log('Creating bus...');
    const busRes = await api.post('/buses', {
      busNumber: 'TEST-BUS-' + Date.now(),
      route: { name: 'Test Route', stops: [{ name: 'A', time: '10:00', order: 1 }] },
      schedule: { departure: '10:00', arrival: '11:00', days: ['Monday'] },
      totalSeats: 40
    }, { headers: { Authorization: `Bearer ${adminToken}` } });

    const busId = busRes.data._id;
    console.log('Bus created:', busId);

    console.log('Booking seat 1...');
    const bookRes = await api.post('/bookings', {
      busId: busId,
      seatNumber: 1
    }, { headers: { Authorization: `Bearer ${studentToken}` } });

    console.log('Booking SUCCESS:', bookRes.data);

    console.log('Cleaning up bus...');
    await api.delete(`/buses/${busId}`, { headers: { Authorization: `Bearer ${adminToken}` } });

  } catch (err) {
    if (err.response) {
      console.error('API Error:', err.response.status, err.response.data);
    } else {
      console.error('Network/Script Error:', err.message);
    }
  }
}

testBooking();
