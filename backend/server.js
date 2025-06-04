const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const { createServer } = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

const logger = require('./utils/logger');
const { connectMQTT } = require('./services/mqttService');

// Import routes
const authRoutes = require('./routes/auth');
const systemRoutes = require('./routes/system');
const liquidRoutes = require('./routes/liquid');
const analyticsRoutes = require('./routes/analytics');
const sensorRoutes = require('./routes/sensor');
const maintenanceRoutes = require('./routes/maintenance');
const aiRoutes = require('./routes/ai');

const app = express();
const server = createServer(app);

// Socket.IO setup for real-time communication
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Make io accessible throughout the app
app.set('io', io);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // limit each IP to 1000 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});

// Security middleware
app.use(helmet());
app.use(compression());
app.use(limiter);

// CORS setup
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging middleware
app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }));

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/reflow', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  logger.info('MongoDB connected successfully');
})
.catch((error) => {
  logger.error('MongoDB connection error:', error);
  process.exit(1);
});

// MongoDB connection events
mongoose.connection.on('error', (error) => {
  logger.error('MongoDB error:', error);
});

mongoose.connection.on('disconnected', () => {
  logger.warn('MongoDB disconnected');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  mongoose.connection.close(() => {
    logger.info('MongoDB connection closed');
    process.exit(0);
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/system', systemRoutes);
app.use('/api/liquid', liquidRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/sensor', sensorRoutes);
app.use('/api/maintenance', maintenanceRoutes);
app.use('/api/ai', aiRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    version: process.env.npm_package_version || '1.0.0'
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  logger.error('Unhandled error:', error);
  
  const statusCode = error.statusCode || 500;
  const message = error.message || 'Internal server error';
  
  res.status(statusCode).json({
    success: false,
    error: {
      message,
      ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
    }
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: {
      message: 'Route not found'
    }
  });
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  logger.info(`Client connected: ${socket.id}`);
  
  // Join room for real-time system updates
  socket.join('system-monitoring');
  
  // Handle client disconnection
  socket.on('disconnect', () => {
    logger.info(`Client disconnected: ${socket.id}`);
  });
  
  // Handle custom events
  socket.on('subscribe-sensor-data', (sensorId) => {
    socket.join(`sensor-${sensorId}`);
    logger.info(`Client ${socket.id} subscribed to sensor ${sensorId}`);
  });
  
  socket.on('unsubscribe-sensor-data', (sensorId) => {
    socket.leave(`sensor-${sensorId}`);
    logger.info(`Client ${socket.id} unsubscribed from sensor ${sensorId}`);
  });
});

// Initialize MQTT service
connectMQTT(io);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  logger.info(`ReFlow server running on port ${PORT}`);
  logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
  
  if (process.env.NODE_ENV === 'development') {
    logger.info(`API Documentation: http://localhost:${PORT}/api/health`);
  }
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  server.close(() => {
    process.exit(1);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

module.exports = { app, server, io }; 