import { Request, Response, NextFunction } from 'express';
import { UserRole } from '@prisma/client';
import { authService } from '../services/auth.service';

export interface AuthRequest extends Request {
  userId?: string;
  userRole?: UserRole;
}

/**
 * Middleware to verify user is authenticated
 * Extracts JWT from cookie and attaches userId to request
 */
export function requireAuth(req: AuthRequest, res: Response, next: NextFunction): void {
  try {
    const token = req.cookies?.accessToken;

    if (!token) {
      res.status(401).json({
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required',
        },
      });
      return;
    }

    const decoded = authService.verifyToken(token);

    req.userId = decoded.userId;
    req.userRole = decoded.role;

    // Set i18n language from user preference
    if (decoded.languagePref && req.i18n) {
      req.i18n.changeLanguage(decoded.languagePref);
    }

    next();
  } catch (error) {
    res.status(401).json({
      error: {
        code: 'UNAUTHORIZED',
        message: 'Invalid or expired token',
      },
    });
  }
}

/**
 * Middleware to verify user has specific role
 * Must be used after requireAuth
 */
export function requireRole(...roles: UserRole[]) {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.userId) {
      res.status(401).json({
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required',
        },
      });
      return;
    }

    if (!roles.includes(req.userRole!)) {
      res.status(403).json({
        error: {
          code: 'FORBIDDEN',
          message: 'Insufficient permissions',
        },
      });
      return;
    }

    next();
  };
}
