const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

// Keep Vercel Serverless compatible
// Cron jobs are now triggered natively by Vercel via /api/cron/reset-points

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/buses', require('./routes/buses'));
app.use('/api/bookings', require('./routes/bookings'));
app.use('/api/supervisor', require('./routes/supervisor'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/shifts', require('./routes/shifts'));

// Root and API Welcome Routes
app.get('/', (req, res) => {
  res.send('Welcome to CUET Bus Ticket System API!');
});

app.get('/api', (req, res) => {
  res.send('Welcome to CUET Bus Ticket System API!');
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'CUET Bus API is running' });
});

// Vercel Cron Job Endpoint (Reset points daily)
app.get('/api/cron/reset-points', async (req, res) => {
  try {
    const User = require('./models/User');
    console.log('Running daily point allocation job via Vercel Cron...');
    const result = await User.updateMany(
      { role: 'student' },
      { $inc: { points: 2 } }
    );
    console.log(`Successfully added 2 points to ${result.modifiedCount} students.`);
    res.status(200).json({ message: 'Points successfully allocated' });
  } catch (error) {
    console.error('Error in Vercel Cron point allocation:', error);
    res.status(500).json({ error: 'Failed to allocate points' });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5001;

// Only listen if not deployed on Vercel Serverless (local dev or traditional hosting)
if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

// Export for Vercel Serverless Functions
module.exports = app;
