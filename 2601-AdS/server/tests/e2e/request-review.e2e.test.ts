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

describe('E2E Flow: Request and Review', () => {
  const customerUser = {
    id: 'user-customer-123',
    email: 'customer@test.com',
    passwordHash: 'hashed_password',
    firstName: 'Customer',
    lastName: 'User',
    role: 'CUSTOMER',
    languagePref: 'es',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const providerUser = {
    id: 'user-provider-123',
    email: 'provider@test.com',
    passwordHash: 'hashed_password',
    firstName: 'Provider',
    lastName: 'User',
    role: 'PROVIDER',
    languagePref: 'es',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const providerProfile = {
    id: '11111111-1111-1111-1111-111111111111',
    userId: 'user-provider-123',
    serviceCategoryId: '22222222-2222-2222-2222-222222222222',
    status: 'APPROVED',
    bio: 'Great plumber',
    locationCity: 'Madrid',
    averageRating: 0,
    totalReviews: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const serviceRequest = {
    id: '33333333-3333-3333-3333-333333333333',
    customerId: 'user-customer-123',
    providerId: '11111111-1111-1111-1111-111111111111',
    categoryId: '22222222-2222-2222-2222-222222222222',
    description: 'Need plumbing help',
    status: 'PENDING',
    requestedAt: new Date(),
    respondedAt: null,
    completedAt: null,
    providerNotes: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    customer: { firstName: 'Customer', lastName: 'User' },
    provider: { user: { firstName: 'Provider', lastName: 'User' } },
    category: { nameEs: 'Plomero', nameEn: 'Plumber' }
  };

  const review = {
    id: '44444444-4444-4444-4444-444444444444',
    requestId: '33333333-3333-3333-3333-333333333333',
    customerId: 'user-customer-123',
    providerId: '11111111-1111-1111-1111-111111111111',
    rating: 5,
    comment: 'Excellent work!',
    createdAt: new Date(),
    updatedAt: new Date(),
    customer: { firstName: 'Customer' },
    request: { description: 'Need plumbing help' }
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should complete the request to review workflow successfully', async () => {
    // --- STEP 1: Customer Login ---
    prismaMock.user.findUnique.mockResolvedValue(customerUser as any);
    const customerLoginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'customer@test.com', password: 'Password123!' });
    const customerCookie = customerLoginRes.header['set-cookie'];

    // --- STEP 2: Provider Login ---
    prismaMock.user.findUnique.mockResolvedValue(providerUser as any);
    const providerLoginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'provider@test.com', password: 'Password123!' });
    const providerCookie = providerLoginRes.header['set-cookie'];

    // --- STEP 3: Customer Creates Request ---
    // Customer auth context
    prismaMock.user.findUnique.mockResolvedValue(customerUser as any);
    
    // Check provider exists and is approved
    prismaMock.providerProfile.findUnique.mockResolvedValue(providerProfile as any);
    // Check category exists
    prismaMock.serviceCategory.findUnique.mockResolvedValue({ id: '22222222-2222-2222-2222-222222222222', isActive: true } as any);
    
    // Create Request
    prismaMock.serviceRequest.create.mockResolvedValue(serviceRequest as any);

    const createReqRes = await request(app)
      .post('/api/requests')
      .set('Cookie', customerCookie)
      .send({
        providerId: providerProfile.id,
        categoryId: providerProfile.serviceCategoryId,
        description: 'Need plumbing help',
      });

    expect(createReqRes.status).toBe(201);
    expect(createReqRes.body.request.status).toBe('PENDING');

    // --- STEP 4: Provider Accepts Request ---
    // Provider auth context
    prismaMock.user.findUnique.mockResolvedValue(providerUser as any);
    
    // Find request to respond to
    prismaMock.serviceRequest.findUnique.mockResolvedValue({ 
      ...serviceRequest, 
      provider: { userId: providerUser.id } 
    } as any);

    // Update Request
    const acceptedRequest = { ...serviceRequest, status: 'ACCEPTED', providerNotes: 'I can do this' };
    prismaMock.serviceRequest.update.mockResolvedValue(acceptedRequest as any);

    const respondReqRes = await request(app)
      .patch(`/api/requests/${serviceRequest.id}/respond`)
      .set('Cookie', providerCookie)
      .send({ action: 'accept', notes: 'I can do this' });

    expect(respondReqRes.status).toBe(200);
    expect(respondReqRes.body.request.status).toBe('ACCEPTED');

    // --- STEP 5: Provider Marks Complete ---
    // Provide auth context again (already mocked above)
    
    // Find request to complete
    prismaMock.serviceRequest.findUnique.mockResolvedValue({ 
      ...acceptedRequest, 
      provider: { userId: providerUser.id } 
    } as any);

    // Update Request to COMPLETED
    const completedRequest = { ...acceptedRequest, status: 'COMPLETED' };
    prismaMock.serviceRequest.update.mockResolvedValue(completedRequest as any);

    const completeReqRes = await request(app)
      .patch(`/api/requests/${serviceRequest.id}/complete`)
      .set('Cookie', providerCookie);

    expect(completeReqRes.status).toBe(200);
    expect(completeReqRes.body.request.status).toBe('COMPLETED');

    // --- STEP 6: Customer Leaves a Review ---
    // Customer auth context
    prismaMock.user.findUnique.mockResolvedValue(customerUser as any);

    // Find request to verify it is completed and belongs to customer
    prismaMock.serviceRequest.findUnique.mockResolvedValue({ 
      ...completedRequest, 
      provider: { userId: providerUser.id } 
    } as any);

    // Create Review
    prismaMock.review.create.mockResolvedValue(review as any);

    // Aggregate rating
    prismaMock.review.aggregate.mockResolvedValue({
      _avg: { rating: 5 },
      _count: { rating: 1 }
    } as any);

    // Update provider rating
    prismaMock.providerProfile.update.mockResolvedValue({ ...providerProfile, averageRating: 5, totalReviews: 1 } as any);

    const createReviewRes = await request(app)
      .post('/api/reviews')
      .set('Cookie', customerCookie)
      .send({
        requestId: serviceRequest.id,
        rating: 5,
        comment: 'Excellent work!'
      });

    expect(createReviewRes.status).toBe(201);
    expect(createReviewRes.body.review.rating).toBe(5);

    // --- STEP 7: Verify Review is in Provider's Profile ---
    prismaMock.review.count.mockResolvedValue(1);
    prismaMock.review.findMany.mockResolvedValue([review] as any);

    const getReviewsRes = await request(app)
      .get(`/api/reviews/provider/${providerProfile.id}`)
      .query({ page: 1, limit: 10 });

    expect(getReviewsRes.status).toBe(200);
    expect(getReviewsRes.body.reviews).toHaveLength(1);
    expect(getReviewsRes.body.reviews[0].rating).toBe(5);
    expect(getReviewsRes.body.reviews[0].comment).toBe('Excellent work!');
  });
});
