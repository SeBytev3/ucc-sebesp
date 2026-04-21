import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth.service';
import { AuthRequest } from '../middleware/auth';

export class AuthController {
  /**
   * POST /api/auth/register
   * Register a new user
   */
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password, firstName, lastName, phone, role } = req.body;

      const { user, token } = await authService.register({
        email,
        password,
        firstName,
        lastName,
        phone,
        role,
      });

      // Set JWT in HTTP-only cookie
      res.cookie('accessToken', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: parseInt(process.env.JWT_COOKIE_EXPIRATION || '1') * 24 * 60 * 60 * 1000, // days to ms
      });

      res.status(201).json({ user });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/auth/login
   * Login user
   */
  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;

      const { user, token } = await authService.login({
        email,
        password,
      });

      // Set JWT in HTTP-only cookie
      res.cookie('accessToken', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: parseInt(process.env.JWT_COOKIE_EXPIRATION || '1') * 24 * 60 * 60 * 1000,
      });

      res.json({ user });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/auth/logout
   * Logout user (clear cookie)
   */
  logout(req: Request, res: Response, next: NextFunction) {
    try {
      res.clearCookie('accessToken');
      res.json({ message: (req as any).t('auth.logout_success') });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/auth/me
   * Get current user profile
   */
  async getMe(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await authService.getUserById(req.userId!);

      if (!user) {
        res.status(404).json({
          error: {
            code: 'NOT_FOUND',
            message: (req as any).t('auth.user_not_found'),
          },
        });
        return;
      }

      res.json({ user });
    } catch (error) {
      next(error);
    }
  }
}

export const authController = new AuthController();
