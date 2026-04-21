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

describe('ReviewController (Integration)', () => {
  const customerUser = {
    id: 'user-customer-123',
    email: 'customer@test.com',
    passwordHash: 'hashed_password',
    firstName: 'Cus',
    lastName: 'Tomer',
    role: 'CUSTOMER',
    languagePref: 'es',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const loginData = {
    email: 'customer@test.com',
    password: 'Password123!',
  };

  const mockReview = {
    id: '44444444-4444-4444-4444-444444444444',
    requestId: '33333333-3333-3333-3333-333333333333',
    customerId: 'user-customer-123',
    providerId: '11111111-1111-1111-1111-111111111111',
    rating: 5,
    comment: 'Great job!',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  let customerCookie: string;

  beforeAll(async () => {
    // Authenticate as customer to get the cookie
    prismaMock.user.findUnique.mockResolvedValue(customerUser as any);
    
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send(loginData);
      
    customerCookie = loginResponse.header['set-cookie'];
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/reviews', () => {
    it('should create a new review for a completed request', async () => {
      // Mock request finding
      prismaMock.serviceRequest.findUnique.mockResolvedValue({ 
        id: mockReview.requestId, 
        status: 'COMPLETED', 
        customerId: 'user-customer-123',
        providerId: mockReview.providerId,
        provider: { userId: 'user-provider-123' }
      } as any);
      
      // Mock review creation
      prismaMock.review.create.mockResolvedValue({
        ...mockReview,
        customer: { firstName: 'Cus' },
        request: { description: 'test' }
      } as any);

      // Mock aggregate for stats
      prismaMock.review.aggregate.mockResolvedValue({
        _avg: { rating: 5 },
        _count: { rating: 1 }
      } as any);

      // Mock provider profile update
      prismaMock.providerProfile.update.mockResolvedValue({} as any);

      const response = await request(app)
        .post('/api/reviews')
        .set('Cookie', customerCookie)
        .send({
          requestId: mockReview.requestId,
          rating: mockReview.rating,
          comment: mockReview.comment,
        });

      expect(response.status).toBe(201);
      expect(response.body.review.rating).toBe(5);
    });
  });

  describe('GET /api/reviews/provider/:providerId', () => {
    it('should get paginated reviews for a provider', async () => {
      // Mock count
      prismaMock.review.count.mockResolvedValue(1);
      // Mock findMany
      prismaMock.review.findMany.mockResolvedValue([mockReview] as any);

      const response = await request(app)
        .get(`/api/reviews/provider/${mockReview.providerId}`)
        .set('Cookie', customerCookie)
        .query({ page: 1, limit: 10 });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('reviews');
      expect(response.body.reviews).toHaveLength(1);
      expect(response.body.pagination.total).toBe(1);
    });
  });
});
