import { prismaMock } from '../prisma.mock';
import { messageService } from '../../src/services/message.service';
import { notificationService } from '../../src/services/notification.service';

// Mock notification service
jest.mock('../../src/services/notification.service', () => ({
  notificationService: {
    createNotification: jest.fn().mockResolvedValue({}),
  },
}));

describe('MessageService', () => {
  const messageData: any = {
    id: 'msg-1',
    senderId: 'user-1',
    receiverId: 'user-2',
    content: 'Hello',
    isRead: false,
    sender: { firstName: 'Alice' },
    createdAt: new Date(),
  };

  describe('sendMessage', () => {
    it('should throw if requestId provided but not found', async () => {
      prismaMock.serviceRequest.findUnique.mockResolvedValue(null);
      await expect(messageService.sendMessage({ senderId: 'u1', receiverId: 'u2', content: 'hi', requestId: 'r1' }))
        .rejects.toThrow('Service request not found');
    });

    it('should create message and notify receiver', async () => {
      prismaMock.message.create.mockResolvedValue(messageData);
      const result = await messageService.sendMessage({ senderId: 'user-1', receiverId: 'user-2', content: 'Hello' });
      
      expect(prismaMock.message.create).toHaveBeenCalled();
      expect(notificationService.createNotification).toHaveBeenCalled();
      expect(result.id).toBe('msg-1');
    });
  });

  describe('getConversation', () => {
    it('should return paginated messages', async () => {
      prismaMock.message.findMany.mockResolvedValue([messageData]);
      prismaMock.message.count.mockResolvedValue(1);

      const result = await messageService.getConversation('user-1', 'user-2');

      expect(prismaMock.message.findMany).toHaveBeenCalled();
      expect(result.messages).toHaveLength(1);
      expect(result.pagination.total).toBe(1);
    });
  });

  describe('markAsRead', () => {
    it('should update isRead to true if authorized', async () => {
      prismaMock.message.findUnique.mockResolvedValue(messageData); // receiverId is user-2
      prismaMock.message.update.mockResolvedValue({ ...messageData, isRead: true });

      const result = await messageService.markAsRead('msg-1', 'user-2');

      expect(prismaMock.message.update).toHaveBeenCalledWith(expect.objectContaining({
        data: { isRead: true }
      }));
      expect(result.isRead).toBe(true);
    });

    it('should throw if user is not the receiver', async () => {
      prismaMock.message.findUnique.mockResolvedValue(messageData);
      await expect(messageService.markAsRead('msg-1', 'user-wrong'))
        .rejects.toThrow('Not authorized');
    });
  });

  describe('getUnreadCount', () => {
    it('should return count from DB', async () => {
      prismaMock.message.count.mockResolvedValue(5);
      const result = await messageService.getUnreadCount('user-1');
      expect(result).toBe(5);
    });
  });
});
