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

describe('NotificationController (Integration)', () => {
  const user1 = {
    id: 'user-1',
    email: 'user1@test.com',
    passwordHash: 'hashed_password',
    firstName: 'User',
    lastName: 'One',
    role: 'CUSTOMER',
    languagePref: 'es',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockNotification = {
    id: 'notif-1',
    userId: 'user-1',
    type: 'SYSTEM',
    messageEs: 'Mensaje de prueba',
    messageEn: 'Test message',
    isRead: false,
    linkUrl: null,
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

  describe('GET /api/notifications', () => {
    it('should retrieve notifications for the user', async () => {
      prismaMock.notification.findMany.mockResolvedValue([mockNotification] as any);

      const response = await request(app)
        .get('/api/notifications')
        .set('Cookie', user1Cookie);

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(1);
      expect(response.body[0].message).toBe('Mensaje de prueba');
    });
  });

  describe('PATCH /api/notifications/:id/read', () => {
    it('should mark a single notification as read', async () => {
      prismaMock.notification.findUnique.mockResolvedValue(mockNotification as any);
      prismaMock.notification.update.mockResolvedValue({ ...mockNotification, isRead: true } as any);

      const response = await request(app)
        .patch('/api/notifications/notif-1/read')
        .set('Cookie', user1Cookie);

      expect(response.status).toBe(204);
    });
  });

  describe('PATCH /api/notifications/read-all', () => {
    it('should mark all unread notifications as read', async () => {
      prismaMock.notification.updateMany.mockResolvedValue({ count: 5 });

      const response = await request(app)
        .patch('/api/notifications/read-all')
        .set('Cookie', user1Cookie);

      expect(response.status).toBe(204);
    });
  });

  describe('DELETE /api/notifications/:id', () => {
    it('should delete a notification', async () => {
      prismaMock.notification.findUnique.mockResolvedValue(mockNotification as any);
      prismaMock.notification.delete.mockResolvedValue(mockNotification as any);

      const response = await request(app)
        .delete('/api/notifications/notif-1')
        .set('Cookie', user1Cookie);

      expect(response.status).toBe(204);
    });
  });
});
