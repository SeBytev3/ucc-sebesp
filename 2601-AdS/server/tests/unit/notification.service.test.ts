import { prismaMock } from '../prisma.mock';
import { notificationService } from '../../src/services/notification.service';
import { NotificationType } from '@prisma/client';

describe('NotificationService', () => {
  const notificationData: any = {
    id: 'notif-1',
    userId: 'user-1',
    type: NotificationType.NEW_MESSAGE,
    messageEs: 'Mensaje',
    messageEn: 'Message',
    isRead: false,
    createdAt: new Date(),
  };

  describe('createNotification', () => {
    it('should create a notification', async () => {
      prismaMock.notification.create.mockResolvedValue(notificationData);
      const result = await notificationService.createNotification({
        userId: 'user-1',
        type: NotificationType.NEW_MESSAGE,
        messageEs: 'Mensaje',
        messageEn: 'Message',
      });
      expect(prismaMock.notification.create).toHaveBeenCalled();
      expect(result.id).toBe('notif-1');
    });
  });

  describe('getNotifications', () => {
    it('should return all notifications for user', async () => {
      prismaMock.notification.findMany.mockResolvedValue([notificationData]);
      const result = await notificationService.getNotifications('user-1');
      expect(result).toHaveLength(1);
    });

    it('should filter by unread if requested', async () => {
      prismaMock.notification.findMany.mockResolvedValue([]);
      await notificationService.getNotifications('user-1', true);
      expect(prismaMock.notification.findMany).toHaveBeenCalledWith(expect.objectContaining({
        where: { userId: 'user-1', isRead: false }
      }));
    });
  });

  describe('markAsRead', () => {
    it('should update isRead if authorized', async () => {
      prismaMock.notification.findUnique.mockResolvedValue(notificationData);
      prismaMock.notification.update.mockResolvedValue({ ...notificationData, isRead: true });

      const result = await notificationService.markAsRead('notif-1', 'user-1');

      expect(result.isRead).toBe(true);
    });

    it('should throw if unauthorized', async () => {
      prismaMock.notification.findUnique.mockResolvedValue(notificationData);
      await expect(notificationService.markAsRead('notif-1', 'user-wrong'))
        .rejects.toThrow('Not authorized');
    });
  });

  describe('markAllAsRead', () => {
    it('should call updateMany', async () => {
      prismaMock.notification.updateMany.mockResolvedValue({ count: 5 });
      const result = await notificationService.markAllAsRead('user-1');
      expect(result.count).toBe(5);
    });
  });

  describe('deleteNotification', () => {
    it('should delete if authorized', async () => {
      prismaMock.notification.findUnique.mockResolvedValue(notificationData);
      prismaMock.notification.delete.mockResolvedValue(notificationData);
      
      await notificationService.deleteNotification('notif-1', 'user-1');
      expect(prismaMock.notification.delete).toHaveBeenCalled();
    });
  });
});
