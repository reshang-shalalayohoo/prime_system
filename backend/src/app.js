const express = require('express');
const cors = require('cors');
const errorHandler = require('./middleware/errorHandler');

// Route imports
const authRoutes = require('./routes/auth.routes');
const sensorRoutes = require('./routes/sensor.routes');
const recommendationRoutes = require('./routes/recommendation.routes');
const fertilizerRoutes = require('./routes/fertilizer.routes');
const alertRoutes = require('./routes/alert.routes');
const reportRoutes = require('./routes/report.routes');
const deviceRoutes = require('./routes/device.routes');
const referenceRoutes = require('./routes/reference.routes');
const userRoutes = require('./routes/user.routes');
const activityRoutes = require('./routes/activity.routes');

const app = express();

// Middleware — support web + mobile origins
const getCorsOrigins = () => {
  const envOrigins = process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(',').map(s => s.trim().replace(/\/$/, ''))
    : [];

  const defaults = [
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:3000',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:5174'
  ];

  return [...new Set([...defaults, ...envOrigins])];
};

const allowedOrigins = getCorsOrigins();

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, Postman, server-to-server)
    if (!origin) return callback(null, true);

    const cleanOrigin = origin.replace(/\/$/, '');

    // Allow configured origins or wildcard
    if (allowedOrigins.includes('*') || allowedOrigins.includes(cleanOrigin)) {
      return callback(null, true);
    }

    // Allow any Vercel deployment (production, preview branches)
    if (cleanOrigin.endsWith('.vercel.app')) {
      return callback(null, true);
    }

    // Allow local network IP addresses for local testing across devices
    if (
      cleanOrigin.includes('localhost') ||
      cleanOrigin.includes('127.0.0.1') ||
      cleanOrigin.includes('192.168.') ||
      cleanOrigin.includes('10.0.')
    ) {
      return callback(null, true);
    }

    // Permissive fallback
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));
app.options('*', cors());
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'PRIME Backend', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/sensors', sensorRoutes);
app.use('/api/recommendations', recommendationRoutes);
app.use('/api/fertilizer', fertilizerRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/devices', deviceRoutes);
app.use('/api/reference', referenceRoutes);
app.use('/api/users', userRoutes);
app.use('/api/activity', activityRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.path} not found` });
});

// Global error handler
app.use(errorHandler);

module.exports = app;
