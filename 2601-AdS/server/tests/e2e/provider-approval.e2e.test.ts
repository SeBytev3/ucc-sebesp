import { prismaMock } from '../prisma.mock';

jest.mock('bcrypt', () => ({
  hash: jest.fn().mockResolvedValue('hashed_password'),
  compare: jest.fn().mockResolvedValue(true),
}));

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
      req.language = 'es';
      next();
    },
  },
}));

import request from 'supertest';
import { app } from '../../src/index';

describe('E2E Flow: Provider Registration and Approval', () => {
  const customerUser = {
    id: 'user-123',
    email: 'newprovider@test.com',
    passwordHash: 'hashed_password',
    firstName: 'John',
    lastName: 'Doe',
    role: 'CUSTOMER',
    languagePref: 'es',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

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

  const pendingProfile = {
    id: '33333333-3333-3333-3333-333333333333',
    userId: 'user-123',
    serviceCategoryId: 'cat-123',
    status: 'PENDING',
    bio: 'Great plumber',
    locationCity: 'Madrid',
    averageRating: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const approvedProfile = {
    ...pendingProfile,
    status: 'APPROVED',
    category: { nameEs: 'Plomero', nameEn: 'Plumber' },
    user: { firstName: 'John', lastName: 'Doe' }
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should complete the provider registration and approval workflow successfully', async () => {
    // --- STEP 1: Register User ---
    prismaMock.user.findUnique.mockResolvedValue(null); // email available
    prismaMock.user.create.mockResolvedValue(customerUser as any);

    const registerRes = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'newprovider@test.com',
        password: 'Password123!',
        firstName: 'John',
        lastName: 'Doe',
        role: 'CUSTOMER',
      });

    expect(registerRes.status).toBe(201);
    expect(registerRes.body.user.email).toBe('newprovider@test.com');
    const userCookie = registerRes.header['set-cookie'];

    // --- STEP 2: Create Provider Profile ---
    prismaMock.user.findUnique.mockResolvedValue(customerUser as any); // valid user for auth
    prismaMock.providerProfile.findUnique.mockResolvedValue(null); // no existing profile
    const categoryId = '22222222-2222-2222-2222-222222222222';
    prismaMock.serviceCategory.findUnique.mockResolvedValue({ id: categoryId, isActive: true } as any); // valid category
    prismaMock.providerProfile.create.mockResolvedValue(pendingProfile as any);

    const createProfileRes = await request(app)
      .post('/api/providers/register')
      .set('Cookie', userCookie)
      .send({
        serviceCategoryId: categoryId,
        bio: 'Great plumber',
        locationCity: 'Madrid',
        locationRegion: 'Madrid',
        locationLat: 40.4168,
        locationLng: -3.7038,
        certifications: ['Basic Plumbing'],
        availabilityNotes: 'Mon-Fri 9-5',
      });

    expect(createProfileRes.status).toBe(201);
    expect(createProfileRes.body.profile.status).toBe('PENDING');

    // --- STEP 3: Admin Login ---
    prismaMock.user.findUnique.mockResolvedValue(adminUser as any);
    const adminLoginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@test.com', password: 'Password123!' });

    const adminCookie = adminLoginRes.header['set-cookie'];

    // --- STEP 4: Admin Approves Profile ---
    // Make sure requireRole passes by returning admin user on next findUnique (from requireAuth)
    prismaMock.user.findUnique.mockResolvedValue(adminUser as any);
    prismaMock.providerProfile.findUnique.mockResolvedValue(pendingProfile as any); // find pending profile
    prismaMock.providerProfile.update.mockResolvedValue(approvedProfile as any); // update to approved

    const approveRes = await request(app)
      .patch(`/api/admin/providers/${pendingProfile.id}/approve`)
      .set('Cookie', adminCookie);

    expect(approveRes.status).toBe(200);
    expect(approveRes.body.profile.status).toBe('APPROVED');

    // --- STEP 5: Profile is visible in search ---
    prismaMock.providerProfile.count.mockResolvedValue(1);
    prismaMock.providerProfile.findMany.mockResolvedValue([approvedProfile] as any);

    const searchRes = await request(app)
      .get('/api/providers')
      .query({ city: 'Madrid' });

    expect(searchRes.status).toBe(200);
    expect(searchRes.body.providers).toHaveLength(1);
    expect(searchRes.body.providers[0].status).toBe('APPROVED');
    expect(searchRes.body.providers[0].locationCity).toBe('Madrid');
  });
});
