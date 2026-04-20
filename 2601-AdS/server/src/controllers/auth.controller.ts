import { Request, Response } from 'express';
import { authService } from '../services/auth.service';
import { AuthRequest } from '../middleware/auth';

export class AuthController {
  /**
   * POST /api/auth/register
   * Register a new user
   */
  async register(req: Request, res: Response) {
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
  }

  /**
   * POST /api/auth/login
   * Login user
   */
  async login(req: Request, res: Response) {
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
  }

  /**
   * POST /api/auth/logout
   * Logout user (clear cookie)
   */
  logout(_req: Request, res: Response) {
    res.clearCookie('accessToken');
    res.json({ message: 'Logged out successfully' });
  }

  /**
   * GET /api/auth/me
   * Get current user profile
   */
  async getMe(req: AuthRequest, res: Response): Promise<void> {
    const user = await authService.getUserById(req.userId!);

    if (!user) {
      res.status(404).json({
        error: {
          code: 'NOT_FOUND',
          message: 'User not found',
        },
      });
      return;
    }

    res.json({ user });
  }
}

export const authController = new AuthController();
