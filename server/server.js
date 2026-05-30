const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Load env vars
dotenv.config();

// Validate environment variables on startup (skip in test environment)
if (process.env.NODE_ENV !== 'test') {
  const REQUIRED_ENV_VARS = ['MONGO_URI', 'JWT_SECRET'];
  const missingEnv = REQUIRED_ENV_VARS.filter((v) => !process.env[v]);
  if (missingEnv.length > 0) {
    console.error(`❌ FATAL ERROR: Missing environment variables: ${missingEnv.join(', ')}`);
    process.exit(1);
  }
}

// Connect to database (skip in test environment)
if (process.env.NODE_ENV !== 'test') {
  connectDB();
}

const app = express();
const server = http.createServer(app);

// Initialize Socket.io
const io = new Server(server, {
  cors: {
    origin: process.env.ALLOWED_ORIGINS
      ? process.env.ALLOWED_ORIGINS.split(',')
      : ['http://localhost:5173'],
    credentials: true,
  },
});

app.set('io', io);

io.on('connection', (socket) => {
  console.log(`Socket connected: ${socket.id}`);
  socket.on('disconnect', () => {
    console.log(`Socket disconnected: ${socket.id}`);
  });
});

// Middleware
app.use(
  cors({
    origin: process.env.ALLOWED_ORIGINS
      ? process.env.ALLOWED_ORIGINS.split(',')
      : ['http://localhost:5173'],
    credentials: true,
  })
);
app.use(helmet());
app.use(express.json());
app.use(mongoSanitize());

const isTest = process.env.NODE_ENV === 'test' || process.env.JEST_WORKER_ID !== undefined;

// Rate limiter — max 100 requests per 15 minutes per IP
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isTest ? 1000 : 100,
  message: { error: 'Too many requests, please try again later.' },
});
app.use('/api/', limiter);

// Stricter limiter for auth routes — max 10 attempts per 15 min
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isTest ? 1000 : 10,
  message: { error: 'Too many login attempts, please try again later.' },
});
app.use('/api/auth/', authLimiter);

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/buses', require('./routes/buses'));
app.use('/api/bookings', require('./routes/bookings'));
app.use('/api/supervisor', require('./routes/supervisor'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/admin/analytics', require('./routes/analytics'));
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

// Cron Job Endpoint (Reset points daily)
// Protected: only requests with the correct CRON_SECRET can trigger this (e.g. from a Render Cron Job or external service)
const handleResetPoints = async (req, res) => {
  try {
    // Verify the request using the shared secret
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret) {
      return res.status(500).json({ message: 'CRON_SECRET is not configured' });
    }

    if (req.headers.authorization !== `Bearer ${cronSecret}`) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const User = require('./models/User');
    console.log('Running daily point allocation job...');
    const result = await User.updateMany({ role: 'student' }, { $inc: { points: 2 } });
    console.log(`Successfully added 2 points to ${result.modifiedCount} students.`);
    res.status(200).json({ message: 'Points successfully allocated' });
  } catch (error) {
    console.error('Error in daily point allocation:', error);
    res.status(500).json({ error: 'Failed to allocate points' });
  }
};

app.get('/api/cron/reset-points', handleResetPoints);
app.post('/api/cron/reset-points', handleResetPoints);

// Global error handling middleware
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  console.error(`[ERROR] ${req.method} ${req.url} - Status: ${statusCode} - ${err.stack}`);

  res.status(statusCode).json({
    status: err.status || 'error',
    message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
  });
});

const PORT = process.env.PORT || 5001;

// Start the server if not running in a test environment
if (process.env.NODE_ENV !== 'test') {
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

// Export for testing purposes
module.exports = app;
