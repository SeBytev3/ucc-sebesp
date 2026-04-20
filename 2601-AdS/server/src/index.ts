import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { validateEnv } from './config/env';
import authRoutes from './routes/auth.routes';
import categoryRoutes from './routes/category.routes';

// Load environment variables before validating
dotenv.config();

// Validate environment variables on startup
validateEnv();

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(helmet()); // Security headers
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Health check endpoint
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes
app.use('/api', authRoutes);
app.use('/api', categoryRoutes);
// app.use('/api/providers', providerRoutes);
// app.use('/api/admin', adminRoutes);
// app.use('/api/requests', requestRoutes);
// app.use('/api/reviews', reviewRoutes);
// app.use('/api/messages', messageRoutes);
// app.use('/api/notifications', notificationRoutes);

// Global error handler
app.use((_err: Error, _req: express.Request, res: express.Response) => {
  // In production, use proper logging (e.g., Winston, CloudWatch)
  res.status(500).json({
    error: {
      code: 'INTERNAL_ERROR',
      message: 'An internal server error occurred',
    },
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
});

export { app };
