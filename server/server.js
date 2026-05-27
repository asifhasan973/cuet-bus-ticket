const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
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
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',')
    : ['http://localhost:5173'],
  credentials: true,
}));
app.use(express.json());

// Rate limiting for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // max 20 requests per window
  message: { message: 'Too many attempts, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);
app.use('/api/auth/google', authLimiter);

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
// Protected: only Vercel's cron service (or requests with the secret) can trigger this
app.get('/api/cron/reset-points', async (req, res) => {
  try {
    // Verify the request is from Vercel Cron using the shared secret
    const cronSecret = process.env.CRON_SECRET;
    if (cronSecret && req.headers.authorization !== `Bearer ${cronSecret}`) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

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
if (process.env.NODE_ENV !== 'production' && process.env.NODE_ENV !== 'test' && !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

// Export for Vercel Serverless Functions
module.exports = app;
