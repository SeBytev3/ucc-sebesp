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

describe('ProviderController (Integration)', () => {
  const providerUser = {
    id: 'user-provider-123',
    email: 'provider@test.com',
    passwordHash: 'hashed_password',
    firstName: 'Pro',
    lastName: 'Vider',
    role: 'PROVIDER',
    languagePref: 'es',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const loginData = {
    email: 'provider@test.com',
    password: 'Password123!',
  };

  const mockProfile = {
    id: '11111111-1111-1111-1111-111111111111',
    userId: 'user-provider-123',
    serviceCategoryId: '22222222-2222-2222-2222-222222222222',
    status: 'APPROVED',
    bio: 'Professional plumber',
    locationCity: 'Madrid',
    locationRegion: 'Madrid',
    locationLat: 40.4168,
    locationLng: -3.7038,
    averageRating: 4.5,
    totalReviews: 10,
    hourlyRate: 50,
    certifications: ['Certified Plumber'],
    availabilityNotes: 'Available on weekends',
    rejectionReason: null,
    commissionRate: 15,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  let providerCookie: string;

  beforeAll(async () => {
    // Authenticate as provider to get the cookie
    prismaMock.user.findUnique.mockResolvedValue(providerUser as any);
    
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send(loginData);
      
    providerCookie = loginResponse.header['set-cookie'];
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/providers', () => {
    it('should return a list of approved providers matching the search criteria', async () => {
      // Mock the count for pagination
      prismaMock.providerProfile.count.mockResolvedValue(1);
      // Mock the search results
      prismaMock.providerProfile.findMany.mockResolvedValue([mockProfile] as any);

      const response = await request(app)
        .get('/api/providers')
        .query({ city: 'Madrid', page: 1, limit: 10 });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('providers');
      expect(response.body.providers).toHaveLength(1);
      expect(response.body.pagination.total).toBe(1);
      expect(response.body.pagination.page).toBe(1);
    });
  });

  describe('GET /api/providers/:id', () => {
    it('should return a provider profile by ID', async () => {
      prismaMock.providerProfile.findUnique.mockResolvedValue(mockProfile as any);

      const response = await request(app).get(`/api/providers/${mockProfile.id}`);

      expect(response.status).toBe(200);
      expect(response.body.profile.id).toBe(mockProfile.id);
    });

    it('should return 404 if profile not found', async () => {
      prismaMock.providerProfile.findUnique.mockResolvedValue(null);

      const response = await request(app).get('/api/providers/99999999-9999-9999-9999-999999999999');

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });
  });

  describe('POST /api/providers/register', () => {
    const registerData = {
      serviceCategoryId: '22222222-2222-2222-2222-222222222222',
      bio: 'New plumber',
      locationCity: 'Barcelona',
      locationRegion: 'Madrid',
      locationLat: 41.3851,
      locationLng: 2.1734,
      certifications: ['Basic Plumbing'],
      availabilityNotes: 'Mon-Fri 9-5',
    };

    it('should register a new provider profile', async () => {
      prismaMock.providerProfile.findUnique.mockResolvedValue(null); // No existing profile
      prismaMock.serviceCategory.findUnique.mockResolvedValue({ id: registerData.serviceCategoryId, isActive: true } as any);
      
      const newProfile = { id: '33333333-3333-3333-3333-333333333333', userId: providerUser.id, ...registerData, status: 'PENDING' };
      prismaMock.providerProfile.create.mockResolvedValue(newProfile as any);

      const response = await request(app)
        .post('/api/providers/register')
        .set('Cookie', providerCookie)
        .send(registerData);

      expect(response.status).toBe(201);
      expect(response.body.profile.status).toBe('PENDING');
    });

    it('should return 400 for invalid data', async () => {
      const response = await request(app)
        .post('/api/providers/register')
        .set('Cookie', providerCookie)
        .send({ bio: 'Missing category ID' });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('PUT /api/providers/:id', () => {
    const updateData = {
      bio: 'Updated bio',
    };

    it('should update an existing profile', async () => {
      prismaMock.providerProfile.findUnique.mockResolvedValue(mockProfile as any);
      prismaMock.providerProfile.update.mockResolvedValue({ ...mockProfile, ...updateData } as any);

      const response = await request(app)
        .put(`/api/providers/${mockProfile.id}`)
        .set('Cookie', providerCookie)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.profile.bio).toBe('Updated bio');
    });
  });

  describe('POST /api/providers/:id/resubmit', () => {
    it('should resubmit a rejected profile', async () => {
      const rejectedProfile = { ...mockProfile, status: 'REJECTED', rejectionReason: 'Needs more info' };
      prismaMock.providerProfile.findUnique.mockResolvedValue(rejectedProfile as any);
      prismaMock.providerProfile.update.mockResolvedValue({ ...rejectedProfile, status: 'PENDING', rejectionReason: null } as any);

      const response = await request(app)
        .post(`/api/providers/${mockProfile.id}/resubmit`)
        .set('Cookie', providerCookie);

      expect(response.status).toBe(200);
      expect(response.body.profile.status).toBe('PENDING');
    });
  });
});
