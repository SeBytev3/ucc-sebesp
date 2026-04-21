import { prismaMock } from '../prisma.mock';
import { Prisma } from '@prisma/client';

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
      req.language = 'es'; // default language for tests
      next();
    },
  },
}));

import request from 'supertest';
import { app } from '../../src/index';

describe('CategoryController (Integration)', () => {
  const adminUser = {
    id: 'admin-123',
    email: 'admin@test.com',
    passwordHash: 'hashed_password',
    firstName: 'Admin',
    lastName: 'User',
    role: 'ADMIN',
    languagePref: 'es',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const loginData = {
    email: 'admin@test.com',
    password: 'Password123!',
  };

  const mockCategories = [
    {
      id: '11111111-1111-1111-1111-111111111111',
      nameEs: 'Plomero',
      nameEn: 'Plumber',
      descriptionEs: 'Servicios de plomería',
      descriptionEn: 'Plumbing services',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: '22222222-2222-2222-2222-222222222222',
      nameEs: 'Electricista',
      nameEn: 'Electrician',
      descriptionEs: 'Servicios eléctricos',
      descriptionEn: 'Electrical services',
      isActive: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  let adminCookie: string;

  beforeAll(async () => {
    // Authenticate as admin to get the cookie
    prismaMock.user.findUnique.mockResolvedValue(adminUser as any);
    
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send(loginData);
      
    adminCookie = loginResponse.header['set-cookie'];
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/categories', () => {
    it('should return a list of active localized categories (public)', async () => {
      // Setup mock to return only active category
      prismaMock.serviceCategory.findMany.mockResolvedValue([mockCategories[0]] as any);

      const response = await request(app).get('/api/categories');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('categories');
      expect(response.body.categories).toHaveLength(1);
      
      // Should be localized to Spanish by default
      expect(response.body.categories[0].name).toBe('Plomero');
      expect(response.body.categories[0].nameEs).toBeUndefined(); // localized field removed
    });
  });

  describe('GET /api/admin/categories', () => {
    it('should return a list of all categories including inactive ones (admin)', async () => {
      // Setup mock to return all categories
      prismaMock.serviceCategory.findMany.mockResolvedValue(mockCategories as any);

      const response = await request(app)
        .get('/api/admin/categories')
        .set('Cookie', adminCookie);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('categories');
      expect(response.body.categories).toHaveLength(2);
      expect(response.body.categories[0].name).toBe('Plomero');
      expect(response.body.categories[1].name).toBe('Electricista');
    });

    it('should return 401 if not authenticated', async () => {
      const response = await request(app).get('/api/admin/categories');
      expect(response.status).toBe(401);
    });

    it('should return 403 if not admin role', async () => {
      // Create a customer user
      const customerUser = { ...adminUser, role: 'CUSTOMER' };
      prismaMock.user.findUnique.mockResolvedValue(customerUser as any);
      
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send(loginData);
        
      const customerCookie = loginResponse.header['set-cookie'];

      const response = await request(app)
        .get('/api/admin/categories')
        .set('Cookie', customerCookie);
        
      expect(response.status).toBe(403);
    });
  });

  describe('POST /api/admin/categories', () => {
    const newCategory = {
      nameEs: 'Jardinero',
      nameEn: 'Gardener',
      descriptionEs: 'Servicios de jardinería',
      descriptionEn: 'Gardening services',
    };

    it('should create a new category successfully as admin', async () => {
      prismaMock.serviceCategory.create.mockResolvedValue({ id: 'cat-3', ...newCategory, isActive: true } as any);

      const response = await request(app)
        .post('/api/admin/categories')
        .set('Cookie', adminCookie)
        .send(newCategory);

      expect(response.status).toBe(201);
      expect(response.body.category.nameEs).toBe('Jardinero');
    });

    it('should return 400 for invalid data', async () => {
      const response = await request(app)
        .post('/api/admin/categories')
        .set('Cookie', adminCookie)
        .send({ nameEs: 'Solo Español' }); // Missing nameEn

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('PATCH /api/admin/categories/:id', () => {
    it('should update an existing category as admin', async () => {
      const updateData = { isActive: false };
      
      prismaMock.serviceCategory.findUnique.mockResolvedValue(mockCategories[0] as any);
      prismaMock.serviceCategory.update.mockResolvedValue({ ...mockCategories[0], ...updateData } as any);

      const response = await request(app)
        .patch('/api/admin/categories/11111111-1111-1111-1111-111111111111')
        .set('Cookie', adminCookie)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.category.isActive).toBe(false);
    });

    it('should return 404 if category not found', async () => {
      // Prisma throws P2025 error on record not found during update
      const error = new Prisma.PrismaClientKnownRequestError('Record not found', {
        code: 'P2025',
        clientVersion: '5.22.0',
      });
      prismaMock.serviceCategory.update.mockRejectedValue(error);

      const response = await request(app)
        .patch('/api/admin/categories/99999999-9999-9999-9999-999999999999')
        .set('Cookie', adminCookie)
        .send({ isActive: false });

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });
  });
});
