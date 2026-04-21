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

// Mock the upload service to avoid file system operations
jest.mock('../../src/services/upload.service', () => ({
  uploadService: {
    uploadPortfolioImage: jest.fn().mockResolvedValue({
      id: 'img-1',
      providerProfileId: '11111111-1111-1111-1111-111111111111',
      url: '/uploads/portfolio/test-image.jpg',
      caption: 'A test image',
      displayOrder: 0,
      createdAt: new Date(),
    }),
    deletePortfolioImage: jest.fn().mockResolvedValue(undefined),
  }
}));

import request from 'supertest';
import { app } from '../../src/index';

describe('UploadController (Integration)', () => {
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

  const mockProfile = {
    id: '11111111-1111-1111-1111-111111111111',
    userId: 'user-provider-123',
  };

  let providerCookie: string;

  beforeAll(async () => {
    prismaMock.user.findUnique.mockResolvedValue(providerUser as any);
    
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({ email: 'provider@test.com', password: 'Password123!' });
      
    providerCookie = loginResponse.header['set-cookie'];
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/providers/:id/portfolio', () => {
    it('should upload an image successfully', async () => {
      prismaMock.providerProfile.findUnique.mockResolvedValue(mockProfile as any);

      // Create a dummy buffer to act as an image
      const imageBuffer = Buffer.from('dummy image content');

      const response = await request(app)
        .post(`/api/providers/${mockProfile.id}/portfolio`)
        .set('Cookie', providerCookie)
        .attach('image', imageBuffer, 'test.jpg')
        .field('caption', 'A test image');

      expect(response.status).toBe(201);
      expect(response.body.caption).toBe('A test image');
      expect(response.body.url).toContain('/uploads/portfolio/');
    });

    it('should return 400 if no file provided', async () => {
      const response = await request(app)
        .post(`/api/providers/${mockProfile.id}/portfolio`)
        .set('Cookie', providerCookie);

      expect(response.status).toBe(400);
    });
  });

  describe('DELETE /api/providers/:id/portfolio/:imageId', () => {
    it('should delete a portfolio image', async () => {
      prismaMock.providerProfile.findUnique.mockResolvedValue(mockProfile as any);

      const response = await request(app)
        .delete(`/api/providers/${mockProfile.id}/portfolio/img-1`)
        .set('Cookie', providerCookie);

      expect(response.status).toBe(204);
    });
  });
});
