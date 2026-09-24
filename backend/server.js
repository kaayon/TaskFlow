const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const taskRoutes = require('./routes/tasks');
const userRoutes = require('./routes/user');
const authRoutes = require('./routes/auth');
const { isMongoConnected } = require('./services/storage');

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/user', userRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    database: isMongoConnected() ? 'mongodb' : 'in-memory-fallback',
    timestamp: new Date().toISOString(),
  });
});

// 404 Handler for API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({ message: 'API route not found' });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  res.status(err.status || 500).json({
    message: err.message || 'Internal server error',
  });
});

// Start Express server immediately so client requests never fail
app.listen(PORT, () => {
  console.log(`✓ TaskFlow Backend running on http://localhost:${PORT}`);
  console.log(`✓ Endpoints available:`);
  console.log(`   - Tasks: http://localhost:${PORT}/api/tasks (GET, POST, PUT, DELETE)`);
  console.log(`   - Auth:  http://localhost:${PORT}/api/auth/register, /api/auth/login`);
  console.log(`   - User:  http://localhost:${PORT}/api/user`);
  console.log(`   - Health: http://localhost:${PORT}/api/health`);
});

// Connect to MongoDB asynchronously with connection timeout
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/taskflow';

mongoose
  .connect(MONGO_URI, { serverSelectionTimeoutMS: 4000 })
  .then(() => {
    console.log('✓ Successfully connected to MongoDB');
  })
  .catch((err) => {
    console.warn(`ℹ MongoDB connection warning (${err.message})`);
    console.log('✓ Running with in-memory fallback. All task operations, descriptions, priority levels (low, medium, high), and sign up / login work seamlessly!');
    console.log('💡 Note: You can also connect to MongoDB Atlas by providing MONGO_URI in backend/.env');
  });

module.exports = app;
