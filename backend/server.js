import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import 'express-async-errors';
import dotenv from 'dotenv';

import { initSupabase } from './db/supabase.js';
import authMiddleware from './middleware/auth.js';
import errorHandler from './middleware/errorHandler.js';
import requestLogger from './middleware/requestLogger.js';

// Routes
import healthRoutes from './routes/health.js';
import projectRoutes from './routes/projects.js';
import heatMapRoutes from './routes/heatmaps.js';
import testSelectionRoutes from './routes/testSelection.js';
import riskAssessmentRoutes from './routes/riskAssessment.js';
import dashboardRoutes from './routes/dashboard.js';
import adminRoutes from './routes/admin.js';
import usersRoutes from './routes/users.js';

// Configuration
dotenv.config({ path: '.env.local' });
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: function (origin, callback) {
    // Allow localhost with any port in development
    if (!origin || origin.includes('localhost') || origin.includes('127.0.0.1')) {
      callback(null, true);
    } else if (process.env.CORS_ORIGIN && origin === process.env.CORS_ORIGIN) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));
app.use(requestLogger);

// Health check route (NO AUTH REQUIRED)
app.use('/health', healthRoutes);
app.use('/api/v1/health', healthRoutes);

// Admin routes (NO AUTH REQUIRED for now - for development)
app.use('/api/v1/admin', adminRoutes);

// Protected routes (AUTH REQUIRED)
app.use('/api/v1/users', authMiddleware, usersRoutes);
app.use('/api/v1/projects', authMiddleware, projectRoutes);
app.use('/api/v1/heatmaps', authMiddleware, heatMapRoutes);
app.use('/api/v1/test-selection', authMiddleware, testSelectionRoutes);
app.use('/api/v1/risk-assessment', authMiddleware, riskAssessmentRoutes);
app.use('/api/v1/dashboard', authMiddleware, dashboardRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    message: 'Endpoint not found',
    path: req.path,
    method: req.method,
    statusCode: 404,
  });
});

// Error Handling (MUST BE LAST)
app.use(errorHandler);

// Start Server
async function start() {
  try {
    // Initialize Supabase
    await initSupabase();

    const server = app.listen(PORT, () => {
      console.log(`\n✅ INTEGRITY API started successfully`);
      console.log(`📍 Server: http://localhost:${PORT}`);
      console.log(`🏥 Health: http://localhost:${PORT}/health`);
      console.log(`📚 API Base: http://localhost:${PORT}/api/v1`);
      console.log(`\n🔧 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🌍 CORS enabled for: ${process.env.CORS_ORIGIN || 'http://localhost:5173'}\n`);
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
      console.log('\n🛑 SIGTERM received, shutting down gracefully...');
      server.close(() => {
        console.log('✅ Server closed');
        process.exit(0);
      });
    });

    process.on('SIGINT', () => {
      console.log('\n🛑 SIGINT received, shutting down gracefully...');
      server.close(() => {
        console.log('✅ Server closed');
        process.exit(0);
      });
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    console.error(error);
    process.exit(1);
  }
}

start();

export default app;
