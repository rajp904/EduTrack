import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import { connectDB } from './src/config/db.js';
import studentRoutes from './src/routes/studentRoutes.js';
import courseRoutes from './src/routes/courseRoutes.js';
import attendanceRoutes from './src/routes/attendanceRoutes.js';
import marksRoutes from './src/routes/marksRoutes.js';
import analyticsRoutes from './src/routes/analyticsRoutes.js';
import { errorHandler } from './src/middleware/errorHandler.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

const app = express();
const PORT = process.env.PORT || 5001;

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors({
  origin: '*', // Allow development requests
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(morgan('dev'));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'EduTrack API',
    course: 'CSE494 - Intelligent NoSQL Databases',
    timestamp: new Date().toISOString()
  });
});

// Mount API Routes
app.use('/api/students', studentRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/marks', marksRoutes);
app.use('/api/analytics', analyticsRoutes);

// 404 Handler for undefined routes
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    error: `API route not found: ${req.method} ${req.originalUrl}`
  });
});

// Centralized Error Handling Middleware
app.use(errorHandler);

const server = app.listen(PORT, () => {
  console.log(` EduTrack Backend Server running on http://localhost:${PORT}`);
  console.log(` Health check available at http://localhost:${PORT}/api/health`);
});

export default app;
