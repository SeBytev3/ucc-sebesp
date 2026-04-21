import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import path from 'path';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger';
import { validateEnv } from './config/env';
import i18next, { i18nMiddleware } from './config/i18n';
import { errorHandler } from './middleware/error-handler';
import { requestLogger } from './middleware/rate-limit';

// Routes
import authRoutes from './routes/auth.routes';
import categoryRoutes from './routes/category.routes';
import providerRoutes from './routes/provider.routes';
import adminRoutes from './routes/admin.routes';
import requestRoutes from './routes/request.routes';
import reviewRoutes from './routes/review.routes';
import messageRoutes from './routes/message.routes';
import notificationRoutes from './routes/notification.routes';
import uploadRoutes from './routes/upload.routes';

// Load environment variables before validating
dotenv.config();

// Validate environment variables on startup
if (process.env.NODE_ENV !== 'test') {
  validateEnv();
}

const app = express();
const UPLOAD_DIR = process.env.UPLOAD_DIR || 'uploads';

// Middleware
app.use(requestLogger); // Log all requests
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
})); 
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(i18nMiddleware.handle(i18next));

// Serve static files from the uploads directory
app.use('/uploads', express.static(path.join(process.cwd(), UPLOAD_DIR)));

// Health check endpoint
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Root endpoint
app.get('/', (_req, res) => {
  res.json({
    name: 'Services Marketplace API',
    status: 'operational',
    version: '0.1.0'
  });
});

// Swagger documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// API routes
app.use('/api', authRoutes);
app.use('/api', categoryRoutes);
app.use('/api', providerRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api', requestRoutes);
app.use('/api', reviewRoutes);
app.use('/api', messageRoutes);
app.use('/api', notificationRoutes);
app.use('/api', uploadRoutes);

// Global error handler (Must be after all routes)
app.use(errorHandler);

export { app };
