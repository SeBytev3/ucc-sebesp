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

describe('MessageController (Integration)', () => {
  const user1 = {
    id: '11111111-1111-1111-1111-111111111111',
    email: 'user1@test.com',
    passwordHash: 'hashed_password',
    firstName: 'User',
    lastName: 'One',
    role: 'CUSTOMER',
    languagePref: 'es',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const user2 = {
    id: '22222222-2222-2222-2222-222222222222',
    email: 'user2@test.com',
    passwordHash: 'hashed_password',
    firstName: 'User',
    lastName: 'Two',
    role: 'PROVIDER',
    languagePref: 'es',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockMessage = {
    id: '33333333-3333-3333-3333-333333333333',
    senderId: '11111111-1111-1111-1111-111111111111',
    receiverId: '22222222-2222-2222-2222-222222222222',
    requestId: null,
    content: 'Hello there!',
    isRead: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  let user1Cookie: string;

  beforeAll(async () => {
    prismaMock.user.findUnique.mockResolvedValue(user1 as any);
    
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({ email: 'user1@test.com', password: 'Password123!' });
      
    user1Cookie = loginResponse.header['set-cookie'];
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/messages', () => {
    it('should send a message successfully', async () => {
      prismaMock.user.findUnique.mockResolvedValue(user2 as any); // Check receiver exists
      prismaMock.message.create.mockResolvedValue({
        ...mockMessage,
        sender: { firstName: 'User' }
      } as any);

      const response = await request(app)
        .post('/api/messages')
        .set('Cookie', user1Cookie)
        .send({
          receiverId: '22222222-2222-2222-2222-222222222222',
          content: 'Hello there!',
        });

      expect(response.status).toBe(201);
      expect(response.body.content).toBe('Hello there!');
    });
  });

  describe('GET /api/messages/conversation/:userId', () => {
    it('should retrieve conversation messages', async () => {
      prismaMock.message.count.mockResolvedValue(1);
      prismaMock.message.findMany.mockResolvedValue([mockMessage] as any);

      const response = await request(app)
        .get('/api/messages/conversation/22222222-2222-2222-2222-222222222222')
        .set('Cookie', user1Cookie)
        .query({ page: 1, limit: 10 });

      expect(response.status).toBe(200);
      expect(response.body.messages).toHaveLength(1);
      expect(response.body.pagination.total).toBe(1);
    });
  });

  describe('PATCH /api/messages/:messageId/read', () => {
    it('should mark a message as read', async () => {
      prismaMock.message.findUnique.mockResolvedValue({ ...mockMessage, receiverId: '11111111-1111-1111-1111-111111111111' } as any); // Re-assign receiver to user1 for auth check
      prismaMock.message.update.mockResolvedValue({ ...mockMessage, isRead: true } as any);

      const response = await request(app)
        .patch('/api/messages/33333333-3333-3333-3333-333333333333/read')
        .set('Cookie', user1Cookie);

      expect(response.status).toBe(204);
    });
  });

  describe('GET /api/messages/unread-count', () => {
    it('should get unread messages count', async () => {
      prismaMock.message.count.mockResolvedValue(5);

      const response = await request(app)
        .get('/api/messages/unread-count')
        .set('Cookie', user1Cookie);

      expect(response.status).toBe(200);
      expect(response.body.count).toBe(5);
    });
  });
});
