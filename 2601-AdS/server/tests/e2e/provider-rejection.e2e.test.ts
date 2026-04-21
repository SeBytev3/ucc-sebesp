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

describe('E2E Flow: Reject Provider, Edit, Resubmit, Approve', () => {
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

  const categoryId = '22222222-2222-2222-2222-222222222222';

  const pendingProfile = {
    id: '11111111-1111-1111-1111-111111111111',
    userId: providerUser.id,
    serviceCategoryId: categoryId,
    status: 'PENDING',
    bio: 'Bad bio',
    locationCity: 'Madrid',
    locationRegion: 'Madrid',
    locationLat: 40.4168,
    locationLng: -3.7038,
    certifications: [],
    rejectionReason: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should complete the rejection and resubmission workflow successfully', async () => {
    // --- STEP 1: Provider Login ---
    prismaMock.user.findUnique.mockResolvedValue(providerUser as any);
    const providerLoginRes = await request(app).post('/api/auth/login').send({ email: 'provider@test.com', password: 'Password123!' });
    const providerCookie = providerLoginRes.header['set-cookie'];

    // --- STEP 2: Admin Login ---
    prismaMock.user.findUnique.mockResolvedValue(adminUser as any);
    const adminLoginRes = await request(app).post('/api/auth/login').send({ email: 'admin@test.com', password: 'Password123!' });
    const adminCookie = adminLoginRes.header['set-cookie'];

    // --- STEP 3: Admin Rejects Provider ---
    // Admin auth context
    prismaMock.user.findUnique.mockResolvedValue(adminUser as any);
    prismaMock.providerProfile.findUnique.mockResolvedValue(pendingProfile as any);
    
    const rejectionReason = 'Bio is too short and needs certifications';
    const rejectedProfile = { ...pendingProfile, status: 'REJECTED', rejectionReason };
    prismaMock.providerProfile.update.mockResolvedValue(rejectedProfile as any);
    prismaMock.notification.create.mockResolvedValue({} as any);

    const rejectRes = await request(app)
      .patch(`/api/admin/providers/${pendingProfile.id}/reject`)
      .set('Cookie', adminCookie)
      .send({ reason: rejectionReason });

    expect(rejectRes.status).toBe(200);
    expect(rejectRes.body.profile.status).toBe('REJECTED');
    expect(rejectRes.body.profile.rejectionReason).toBe(rejectionReason);

    // --- STEP 4: Provider Edits Profile ---
    // Provider auth context
    prismaMock.user.findUnique.mockResolvedValue(providerUser as any);
    prismaMock.providerProfile.findUnique.mockResolvedValue(rejectedProfile as any);
    
    const updatedBio = 'I am a highly skilled professional with 10 years of experience.';
    const editedProfile = { ...rejectedProfile, bio: updatedBio };
    prismaMock.providerProfile.update.mockResolvedValue(editedProfile as any);

    const editRes = await request(app)
      .put(`/api/providers/${pendingProfile.id}`)
      .set('Cookie', providerCookie)
      .send({ bio: updatedBio });

    expect(editRes.status).toBe(200);
    expect(editRes.body.profile.bio).toBe(updatedBio);
    expect(editRes.body.profile.status).toBe('REJECTED'); // Status doesn't change on edit automatically

    // --- STEP 5: Provider Resubmits Profile ---
    prismaMock.providerProfile.findUnique.mockResolvedValue(editedProfile as any);
    const resubmittedProfile = { ...editedProfile, status: 'PENDING', rejectionReason: null };
    prismaMock.providerProfile.update.mockResolvedValue(resubmittedProfile as any);

    const resubmitRes = await request(app)
      .post(`/api/providers/${pendingProfile.id}/resubmit`)
      .set('Cookie', providerCookie);

    expect(resubmitRes.status).toBe(200);
    expect(resubmitRes.body.profile.status).toBe('PENDING');
    expect(resubmitRes.body.profile.rejectionReason).toBeNull();

    // --- STEP 6: Admin Approves Profile ---
    prismaMock.user.findUnique.mockResolvedValue(adminUser as any);
    prismaMock.providerProfile.findUnique.mockResolvedValue(resubmittedProfile as any);
    const approvedProfile = { ...resubmittedProfile, status: 'APPROVED' };
    prismaMock.providerProfile.update.mockResolvedValue(approvedProfile as any);

    const approveRes = await request(app)
      .patch(`/api/admin/providers/${pendingProfile.id}/approve`)
      .set('Cookie', adminCookie);

    expect(approveRes.status).toBe(200);
    expect(approveRes.body.profile.status).toBe('APPROVED');
  });
});
