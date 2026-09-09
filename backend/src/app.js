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
const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:5173')
  .split(',').map(s => s.trim());

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, Postman)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(null, true); // permissive in dev
    }
  },
  credentials: true
}));
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
