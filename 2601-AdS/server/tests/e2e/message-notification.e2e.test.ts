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

describe('E2E Flow: Send Message and Notification', () => {
  const user1 = {
    id: '11111111-1111-1111-1111-111111111111',
    email: 'user1@test.com',
    passwordHash: 'hashed_password',
    firstName: 'Alice',
    lastName: 'Smith',
    role: 'CUSTOMER',
    languagePref: 'es',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const user2 = {
    id: '22222222-2222-2222-2222-222222222222',
    email: 'user2@test.com',
    passwordHash: 'hashed_password',
    firstName: 'Bob',
    lastName: 'Jones',
    role: 'PROVIDER',
    languagePref: 'es',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const message = {
    id: '33333333-3333-3333-3333-333333333333',
    senderId: user1.id,
    receiverId: user2.id,
    content: 'Hi, I need a plumber.',
    isRead: false,
    requestId: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const notification = {
    id: '44444444-4444-4444-4444-444444444444',
    userId: user2.id,
    type: 'NEW_MESSAGE',
    messageEs: `Has recibido un nuevo mensaje de ${user1.firstName}`,
    messageEn: `You have received a new message from ${user1.firstName}`,
    linkUrl: `/messages/${user1.id}`,
    isRead: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should send a message, create a notification, and allow the receiver to read it', async () => {
    // --- STEP 1: User 1 Login ---
    prismaMock.user.findUnique.mockResolvedValue(user1 as any);
    const loginRes1 = await request(app).post('/api/auth/login').send({ email: 'user1@test.com', password: 'Password123!' });
    const cookie1 = loginRes1.header['set-cookie'];

    // --- STEP 2: User 2 Login ---
    prismaMock.user.findUnique.mockResolvedValue(user2 as any);
    const loginRes2 = await request(app).post('/api/auth/login').send({ email: 'user2@test.com', password: 'Password123!' });
    const cookie2 = loginRes2.header['set-cookie'];

    // --- STEP 3: User 1 sends message to User 2 ---
    // Mock user lookup for receiver
    prismaMock.user.findUnique.mockResolvedValue(user2 as any);
    
    // Mock message creation
    prismaMock.message.create.mockResolvedValue({
      ...message,
      sender: { firstName: user1.firstName }
    } as any);

    // Mock notification creation (the service catches errors if this fails, but we'll mock it successfully)
    prismaMock.notification.create.mockResolvedValue(notification as any);

    const sendMsgRes = await request(app)
      .post('/api/messages')
      .set('Cookie', cookie1)
      .send({
        receiverId: user2.id,
        content: 'Hi, I need a plumber.'
      });

    expect(sendMsgRes.status).toBe(201);
    expect(sendMsgRes.body.content).toBe('Hi, I need a plumber.');

    // --- STEP 4: User 2 checks unread messages count ---
    prismaMock.message.count.mockResolvedValue(1);
    
    const unreadCountRes = await request(app)
      .get('/api/messages/unread-count')
      .set('Cookie', cookie2);

    expect(unreadCountRes.status).toBe(200);
    expect(unreadCountRes.body.count).toBe(1);

    // --- STEP 5: User 2 checks notifications ---
    prismaMock.notification.findMany.mockResolvedValue([notification] as any);

    const notifRes = await request(app)
      .get('/api/notifications')
      .set('Cookie', cookie2);

    expect(notifRes.status).toBe(200);
    expect(notifRes.body).toHaveLength(1);
    expect(notifRes.body[0].message).toContain('nuevo mensaje');

    // --- STEP 6: User 2 reads the message ---
    prismaMock.message.findUnique.mockResolvedValue(message as any);
    prismaMock.message.update.mockResolvedValue({ ...message, isRead: true } as any);

    const readMsgRes = await request(app)
      .patch(`/api/messages/${message.id}/read`)
      .set('Cookie', cookie2);

    expect(readMsgRes.status).toBe(204);
  });
});
