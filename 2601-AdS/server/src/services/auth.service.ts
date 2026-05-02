import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { UserRole } from '@prisma/client';
import { prisma } from '../config/database';

interface RegisterInput {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: UserRole;
}

interface LoginInput {
  email: string;
  password: string;
}

export class AuthService {
  /**
   * Register a new user with email/password
   */
  async register(input: RegisterInput) {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: input.email },
    });

    if (existingUser) {
      throw new Error('Email already registered');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(input.password, 12);

    // Create user
    const user = await prisma.user.create({
      data: {
        email: input.email.toLowerCase(),
        passwordHash,
        firstName: input.firstName,
        lastName: input.lastName,
        phone: input.phone,
        role: input.role,
        languagePref: 'es', // Default to Spanish
      },
      omit: {
        passwordHash: true,
      },
    });

    // Generate JWT token
    const token = this.generateToken(user.id, user.role, user.languagePref);

    return { user, token };
  }

  /**
   * Login user with email/password
   */
  async login(input: LoginInput) {
    // Find user by email
    const userWithPassword = await prisma.user.findUnique({
      where: { email: input.email.toLowerCase() },
      include: {
        providerProfile: {
          select: {
            id: true,
            status: true,
            rejectionReason: true,
          }
        }
      }
    });

    if (!userWithPassword || !userWithPassword.passwordHash) {
      throw new Error('Invalid email or password');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(input.password, userWithPassword.passwordHash);

    if (!isPasswordValid) {
      throw new Error('Invalid email or password');
    }

    // Generate JWT token
    const token = this.generateToken(userWithPassword.id, userWithPassword.role, userWithPassword.languagePref);

    const { passwordHash: _, ...userWithoutPassword } = userWithPassword;

    return {
      user: userWithoutPassword,
      token,
    };
  }

  /**
   * Generate JWT token
   */
  private generateToken(userId: string, role: UserRole, languagePref: string): string {
    const secret = process.env.JWT_SECRET;

    if (!secret) {
      throw new Error('JWT_SECRET not configured');
    }

    return jwt.sign({ sub: userId, role, lng: languagePref }, secret, { expiresIn: '24h' as const });
  }

  /**
   * Verify JWT token
   */
  verifyToken(token: string): { userId: string; role: UserRole; languagePref: string } {
    const secret = process.env.JWT_SECRET;

    if (!secret) {
      throw new Error('JWT_SECRET not configured');
    }

    const decoded = jwt.verify(token, secret) as {
      sub: string;
      role: UserRole;
      lng: string;
    };

    return {
      userId: decoded.sub,
      role: decoded.role,
      languagePref: decoded.lng || 'es',
    };
  }

  /**
   * Get user profile by ID
   */
  async getUserById(id: string) {
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        providerProfile: {
          select: {
            id: true,
            status: true,
            rejectionReason: true,
          }
        }
      },
      omit: {
        passwordHash: true,
      },
    });

    return user;
  }
}

export const authService = new AuthService();
