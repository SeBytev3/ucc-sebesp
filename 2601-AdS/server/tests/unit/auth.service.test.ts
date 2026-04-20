import { prismaMock } from '../prisma.mock';
import { authService } from '../../src/services/auth.service';
import jwt from 'jsonwebtoken';

// Mock bcrypt
jest.mock('bcrypt', () => ({
  hash: jest.fn().mockResolvedValue('hashed'),
  compare: jest.fn().mockResolvedValue(true),
}));

// Mock jwt
jest.mock('jsonwebtoken', () => ({
  sign: jest.fn().mockReturnValue('token'),
  verify: jest.fn(),
}));

describe('AuthService', () => {
  const registerData = {
    email: 'test@test.com',
    password: 'password',
    firstName: 'John',
    lastName: 'Doe',
    role: 'CUSTOMER' as const,
  };

  beforeEach(() => {
    process.env.JWT_SECRET = 'secret';
  });

  describe('register', () => {
    it('should create user', async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);
      prismaMock.user.create.mockResolvedValue({ id: 'u1', ...registerData, languagePref: 'es' } as any);

      const result = await authService.register(registerData);
      expect(result.user.id).toBe('u1');
      expect(result.token).toBe('token');
    });

    it('should throw if email taken', async () => {
      prismaMock.user.findUnique.mockResolvedValue({ id: 'u1' } as any);
      await expect(authService.register(registerData)).rejects.toThrow('Email already registered');
    });
  });

  describe('login', () => {
    it('should return user and token', async () => {
      prismaMock.user.findUnique.mockResolvedValue({ id: 'u1', passwordHash: 'hash', languagePref: 'es' } as any);
      const result = await authService.login({ email: 'test@test.com', password: 'password' });
      expect(result.token).toBe('token');
    });
  });

  describe('verifyToken', () => {
    it('should return decoded with userId', () => {
      (jwt.verify as jest.Mock).mockReturnValue({ sub: 'u1', role: 'ADMIN', lng: 'en' });
      const result = authService.verifyToken('valid');
      expect(result.userId).toBe('u1');
      expect(result.languagePref).toBe('en');
    });
  });
});
