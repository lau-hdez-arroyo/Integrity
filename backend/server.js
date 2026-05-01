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

// Configuration
dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

// Initialize Supabase
await initSupabase();

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));
app.use(requestLogger);

// Routes
app.use('/api/v1/health', healthRoutes);
app.use('/api/v1/projects', projectRoutes);
app.use('/api/v1/heatmaps', heatMapRoutes);
app.use('/api/v1/test-selection', authMiddleware, testSelectionRoutes);
app.use('/api/v1/risk-assessment', authMiddleware, riskAssessmentRoutes);
app.use('/api/v1/dashboard', authMiddleware, dashboardRoutes);

// Error Handling
app.use(errorHandler);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    path: req.path,
    method: req.method,
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`✅ INTEGRITY API running on http://localhost:${PORT}`);
  console.log(`📚 Swagger UI: http://localhost:${PORT}/api/v1/health`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
});

export default app;
