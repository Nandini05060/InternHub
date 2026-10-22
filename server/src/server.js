import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { config } from './config/env.js';
import { isDbConnected } from './db/mysql.js';
import { errorHandler } from './middleware/errorHandler.js';

import authRoutes from './routes/auth.routes.js';
import internshipRoutes from './routes/internship.routes.js';
import bookmarkRoutes from './routes/bookmark.routes.js';
import applicationRoutes from './routes/application.routes.js';
import notificationRoutes from './routes/notification.routes.js';
import adminRoutes from './routes/admin.routes.js';
import testRunnerRoutes from './routes/testRunner.routes.js';
import careerRoutes from './routes/career.routes.js';

const app = express();


// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

if (config.nodeEnv !== 'test') {
  app.use(morgan('dev'));
}

// System Health & Diagnostics Endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    appName: 'InternHub API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    database: {
      driver: 'mysql2',
      connected: isDbConnected(),
      mode: isDbConnected() ? 'MySQL Production' : 'Memory / Fallback Store'
    }
  });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/internships', internshipRoutes);
app.use('/api/bookmarks', bookmarkRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/tests', testRunnerRoutes);
app.use('/api/career', careerRoutes);


// Catch 404
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `API route '${req.method} ${req.originalUrl}' was not found.`
  });
});

// Error handling middleware
app.use(errorHandler);

export default app;
