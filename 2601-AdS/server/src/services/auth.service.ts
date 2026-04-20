import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { UserRole } from '@prisma/client';
import prisma from '../config/database';

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
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        languagePref: true,
      },
    });

    // Generate JWT token
    const token = this.generateToken(user.id, user.role);

    return { user, token };
  }

  /**
   * Login user with email/password
   */
  async login(input: LoginInput) {
    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: input.email.toLowerCase() },
    });

    if (!user || !user.passwordHash) {
      throw new Error('Invalid email or password');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(input.password, user.passwordHash);

    if (!isPasswordValid) {
      throw new Error('Invalid email or password');
    }

    // Generate JWT token
    const token = this.generateToken(user.id, user.role);

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        role: user.role,
        languagePref: user.languagePref,
      },
      token,
    };
  }

  /**
   * Generate JWT token
   */
  private generateToken(userId: string, role: UserRole): string {
    const secret = process.env.JWT_SECRET;

    if (!secret) {
      throw new Error('JWT_SECRET not configured');
    }

    return jwt.sign({ sub: userId, role }, secret, { expiresIn: '24h' as const });
  }

  /**
   * Verify JWT token
   */
  verifyToken(token: string): { userId: string; role: UserRole } {
    const secret = process.env.JWT_SECRET;

    if (!secret) {
      throw new Error('JWT_SECRET not configured');
    }

    const decoded = jwt.verify(token, secret) as {
      sub: string;
      role: UserRole;
    };

    return {
      userId: decoded.sub,
      role: decoded.role,
    };
  }

  /**
   * Get user profile by ID
   */
  async getUserById(id: string) {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        languagePref: true,
        createdAt: true,
      },
    });

    return user;
  }
}

export const authService = new AuthService();
