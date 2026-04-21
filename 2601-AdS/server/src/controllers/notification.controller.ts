import { Response, NextFunction } from 'express';
import { notificationService } from '../services/notification.service';
import { AuthRequest } from '../middleware/auth';
import { localizeArray } from '../utils/i18n-utils';

class NotificationController {
  async getNotifications(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.userId!;
      const unreadOnly = req.query.unread === 'true';

      const notifications = await notificationService.getNotifications(userId, unreadOnly);
      const lng = (req as any).language || 'es';

      res.json(localizeArray(notifications, lng, ['message']));
    } catch (error) {
      next(error);
    }
  }

  async markAsRead(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.userId!;
      const id = req.params.id as string;

      await notificationService.markAsRead(id, userId);

      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }

  async markAllAsRead(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.userId!;

      await notificationService.markAllAsRead(userId);

      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }

  async deleteNotification(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.userId!;
      const id = req.params.id as string;

      await notificationService.deleteNotification(id, userId);

      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}

export const notificationController = new NotificationController();
