import rateLimit from 'express-rate-limit';
import { Request, Response, NextFunction } from 'express';

/**
 * Rate limiter for auth endpoints (register, login)
 * Limits to 10 requests per minute per IP.
 */
export const authRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // Limit each IP to 10 requests per windowMs
  message: {
    error: {
      code: 'TOO_MANY_REQUESTS',
      message: 'Too many authentication attempts. Please try again in a minute.',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Rate limiter for messages to prevent spam.
 * Limits to 50 messages per hour per user.
 */
export const messageRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 50, // Limit each user to 50 messages per windowMs
  keyGenerator: (req: any) => {
    return req.userId || req.ip || 'anonymous';
  },
  message: {
    error: {
      code: 'TOO_MANY_REQUESTS',
      message: 'Message limit reached. Please try again in an hour.',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Simple request logger middleware
 */
export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const { method, url } = req;
    const { statusCode } = res;
    
    console.log(`📡 [${new Date().toISOString()}] ${method} ${url} ${statusCode} - ${duration}ms`);
  });
  
  next();
};
