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
      req.language = 'es'; // default language for tests
      next();
    },
  },
}));

import request from 'supertest';
import { app } from '../../src/index';

describe('AdminController (Integration)', () => {
  const adminUser = {
    id: 'admin-user-123',
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

  const mockProfile = {
    id: '11111111-1111-1111-1111-111111111111',
    userId: 'user-provider-123',
    serviceCategoryId: '22222222-2222-2222-2222-222222222222',
    status: 'PENDING',
    bio: 'Professional plumber',
    locationCity: 'Madrid',
    locationRegion: 'Madrid',
    locationLat: 40.4168,
    locationLng: -3.7038,
    averageRating: 0,
    totalReviews: 0,
    hourlyRate: 50,
    certifications: ['Certified Plumber'],
    availabilityNotes: 'Available on weekends',
    rejectionReason: null,
    commissionRate: 15,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

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

  describe('GET /api/admin/providers/pending', () => {
    it('should return a list of pending providers', async () => {
      prismaMock.providerProfile.findMany.mockResolvedValue([mockProfile] as any);

      const response = await request(app)
        .get('/api/admin/providers/pending')
        .set('Cookie', adminCookie);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('profiles');
      expect(response.body.profiles).toHaveLength(1);
    });
  });

  describe('PATCH /api/admin/providers/:id/approve', () => {
    it('should approve a provider profile', async () => {
      prismaMock.providerProfile.findUnique.mockResolvedValue({ ...mockProfile, status: 'PENDING' } as any);
      prismaMock.providerProfile.update.mockResolvedValue({ ...mockProfile, status: 'APPROVED' } as any);

      const response = await request(app)
        .patch(`/api/admin/providers/${mockProfile.id}/approve`)
        .set('Cookie', adminCookie);

      expect(response.status).toBe(200);
      expect(response.body.profile.status).toBe('APPROVED');
    });
  });

  describe('PATCH /api/admin/providers/:id/reject', () => {
    it('should reject a provider profile with a reason', async () => {
      const rejectionReason = 'Insufficient documentation';
      
      prismaMock.providerProfile.findUnique.mockResolvedValue({ ...mockProfile, status: 'PENDING' } as any);
      prismaMock.providerProfile.update.mockResolvedValue({ ...mockProfile, status: 'REJECTED', rejectionReason } as any);

      const response = await request(app)
        .patch(`/api/admin/providers/${mockProfile.id}/reject`)
        .set('Cookie', adminCookie)
        .send({ reason: rejectionReason });

      expect(response.status).toBe(200);
      expect(response.body.profile.status).toBe('REJECTED');
      expect(response.body.profile.rejectionReason).toBe(rejectionReason);
    });
  });

  describe('PATCH /api/admin/providers/:id/deactivate', () => {
    it('should deactivate a provider profile', async () => {
      prismaMock.providerProfile.findUnique.mockResolvedValue({ ...mockProfile, status: 'APPROVED' } as any);
      prismaMock.providerProfile.update.mockResolvedValue({ ...mockProfile, status: 'DEACTIVATED' } as any);

      const response = await request(app)
        .patch(`/api/admin/providers/${mockProfile.id}/deactivate`)
        .set('Cookie', adminCookie);

      expect(response.status).toBe(200);
      expect(response.body.profile.status).toBe('DEACTIVATED');
    });
  });

  describe('PATCH /api/admin/providers/:id/commission', () => {
    it('should set a custom commission rate', async () => {
      prismaMock.providerProfile.findUnique.mockResolvedValue({ ...mockProfile, status: 'APPROVED' } as any);
      prismaMock.providerProfile.update.mockResolvedValue({ ...mockProfile, commissionRate: 20 } as any);

      const response = await request(app)
        .patch(`/api/admin/providers/${mockProfile.id}/commission`)
        .set('Cookie', adminCookie)
        .send({ commissionRate: 20 });

      expect(response.status).toBe(200);
      expect(response.body.updated.commissionRate).toBe(20);
    });
  });
});
