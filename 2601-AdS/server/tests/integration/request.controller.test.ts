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

describe('RequestController (Integration)', () => {
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
    email: 'customer@test.com',
    password: 'Password123!',
  };

  const mockRequest = {
    id: '33333333-3333-3333-3333-333333333333',
    customerId: 'user-customer-123',
    providerId: '11111111-1111-1111-1111-111111111111',
    serviceCategoryId: '22222222-2222-2222-2222-222222222222',
    status: 'PENDING',
    description: 'Need plumbing help',
    requestedAt: new Date(),
    respondedAt: null,
    completedAt: null,
    providerNotes: null,
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

  describe('POST /api/requests', () => {
    it('should create a new service request', async () => {
      // Mock provider profile finding
      prismaMock.providerProfile.findUnique.mockResolvedValue({ id: mockRequest.providerId, status: 'APPROVED', userId: 'user-provider-123' } as any);
      // Mock category finding
      prismaMock.serviceCategory.findUnique.mockResolvedValue({ id: mockRequest.serviceCategoryId, isActive: true } as any);
      
      // Mock request creation
      prismaMock.serviceRequest.create.mockResolvedValue({
        ...mockRequest,
        customer: { firstName: 'Cus' },
        provider: { user: { firstName: 'Pro' } }
      } as any);

      const response = await request(app)
        .post('/api/requests')
        .set('Cookie', customerCookie)
        .send({
          providerId: mockRequest.providerId,
          categoryId: mockRequest.serviceCategoryId,
          description: mockRequest.description,
        });

      expect(response.status).toBe(201);
      expect(response.body.request.status).toBe('PENDING');
    });
  });

  describe('GET /api/requests', () => {
    it('should list requests sent by customer', async () => {
      prismaMock.serviceRequest.findMany.mockResolvedValue([mockRequest] as any);

      const response = await request(app)
        .get('/api/requests')
        .set('Cookie', customerCookie)
        .query({ role: 'sent' });

      expect(response.status).toBe(200);
      expect(response.body.requests).toHaveLength(1);
    });
  });

  describe('PATCH /api/requests/:id/respond', () => {
    it('should allow provider to accept a request', async () => {
      // Switch to provider user
      prismaMock.user.findUnique.mockResolvedValue(providerUser as any);
      const provLoginRes = await request(app).post('/api/auth/login').send({ email: 'provider@test.com', password: 'Password123!' });
      const providerCookie = provLoginRes.header['set-cookie'];

      // Find request mock
      prismaMock.serviceRequest.findUnique.mockResolvedValue({ ...mockRequest, provider: { userId: 'user-provider-123' } } as any);
      
      // Update mock
      prismaMock.serviceRequest.update.mockResolvedValue({ 
        ...mockRequest, 
        status: 'ACCEPTED',
        provider: { user: { firstName: 'Pro' } }
      } as any);

      const response = await request(app)
        .patch(`/api/requests/${mockRequest.id}/respond`)
        .set('Cookie', providerCookie)
        .send({ action: 'accept', notes: 'I can do this' });

      expect(response.status).toBe(200);
      expect(response.body.request.status).toBe('ACCEPTED');
    });
  });

  describe('PATCH /api/requests/:id/complete', () => {
    it('should mark request as completed', async () => {
      prismaMock.serviceRequest.findUnique.mockResolvedValue({ ...mockRequest, status: 'ACCEPTED', customerId: customerUser.id, provider: { userId: 'other' } } as any);
      prismaMock.serviceRequest.update.mockResolvedValue({ ...mockRequest, status: 'COMPLETED' } as any);

      const response = await request(app)
        .patch(`/api/requests/${mockRequest.id}/complete`)
        .set('Cookie', customerCookie);

      expect(response.status).toBe(200);
      expect(response.body.request.status).toBe('COMPLETED');
    });
  });

  describe('PATCH /api/requests/:id/cancel', () => {
    it('should cancel a request', async () => {
      prismaMock.serviceRequest.findUnique.mockResolvedValue({ ...mockRequest, status: 'PENDING', customerId: customerUser.id } as any);
      prismaMock.serviceRequest.update.mockResolvedValue({ ...mockRequest, status: 'CANCELLED' } as any);

      const response = await request(app)
        .patch(`/api/requests/${mockRequest.id}/cancel`)
        .set('Cookie', customerCookie);

      expect(response.status).toBe(200);
      expect(response.body.request.status).toBe('CANCELLED');
    });
  });
});
