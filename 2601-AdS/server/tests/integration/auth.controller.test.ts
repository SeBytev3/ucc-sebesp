import { prismaMock } from '../prisma.mock';

// Comprehensive mock for bcrypt BEFORE importing app
jest.mock('bcrypt', () => ({
  hash: jest.fn().mockResolvedValue('hashed_password'),
  compare: jest.fn().mockResolvedValue(true),
}));

// Mock i18next to avoid async file reads
jest.mock('../../src/config/i18n', () => ({
  __esModule: true,
  default: {
    t: (key: string) => key,
    use: () => ({ init: () => {} }),
    init: () => {},
    changeLanguage: () => Promise.resolve(),
    on: () => {},
  },
  i18nMiddleware: {
    handle: () => (req: any, _res: any, next: any) => {
      req.t = (key: string) => key;
      next();
    },
  },
}));

import request from 'supertest';
import { app } from '../../src/index';

describe('AuthController (Integration)', () => {
  const registerData = {
    email: 'newuser@test.com',
    password: 'Password123!',
    firstName: 'John',
    lastName: 'Doe',
    role: 'CUSTOMER',
  };

  const loginData = {
    email: 'newuser@test.com',
    password: 'Password123!',
  };

  const mockUser = {
    id: 'user-123',
    email: 'newuser@test.com',
    passwordHash: 'hashed_password',
    firstName: 'John',
    lastName: 'Doe',
    role: 'CUSTOMER',
    languagePref: 'es',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);
      prismaMock.user.create.mockResolvedValue(mockUser as any);

      const response = await request(app)
        .post('/api/auth/register')
        .send(registerData);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('user');
      expect(response.header['set-cookie']).toBeDefined();
    });

    it('should return 400 if user email is already taken', async () => {
      prismaMock.user.findUnique.mockResolvedValue(mockUser as any);

      const response = await request(app)
        .post('/api/auth/register')
        .send(registerData);

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('BAD_REQUEST');
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login successfully and set cookie', async () => {
      // Return user with correct hash and properties
      prismaMock.user.findUnique.mockResolvedValue(mockUser as any);

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData);

      expect(response.status).toBe(200);
      expect(response.header['set-cookie']).toBeDefined();
      expect(response.body.user.email).toBe(mockUser.email);
    });

    it('should return 401 for invalid credentials', async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData);

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/auth/me', () => {
    it('should return user profile if token is valid', async () => {
      prismaMock.user.findUnique.mockResolvedValue(mockUser as any);
      
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send(loginData);
      
      const cookies = loginResponse.header['set-cookie'];
      expect(cookies).toBeDefined();

      const response = await request(app)
        .get('/api/auth/me')
        .set('Cookie', cookies);

      expect(response.status).toBe(200);
      expect(response.body.user.email).toBe(mockUser.email);
    });
  });

  describe('POST /api/auth/logout', () => {
    it('should clear the authentication cookie', async () => {
      const response = await request(app).post('/api/auth/logout');
      expect(response.status).toBe(200);
      expect(response.header['set-cookie'][0]).toContain('accessToken=;');
    });
  });
});
