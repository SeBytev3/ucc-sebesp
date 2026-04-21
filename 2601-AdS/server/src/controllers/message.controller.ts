import { Response, NextFunction } from 'express';
import { messageService } from '../services/message.service';
import { AuthRequest } from '../middleware/auth';

export class MessageController {
  async sendMessage(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const senderId = req.userId!;
      const { receiverId, content, requestId } = req.body;

      const message = await messageService.sendMessage({
        senderId,
        receiverId,
        content,
        requestId,
      });

      res.status(201).json(message);
    } catch (error) {
      next(error);
    }
  }

  async getConversation(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const currentUserId = req.userId!;
      const otherUserId = req.params.userId as string;
      const page = req.query.page ? Number(req.query.page) : 1;
      const limit = req.query.limit ? Number(req.query.limit) : 20;

      const result = await messageService.getConversation(currentUserId, otherUserId, page, limit);

      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async markAsRead(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.userId!;
      const messageId = req.params.messageId as string;

      await messageService.markAsRead(messageId, userId);

      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }

  async getUnreadCount(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.userId!;
      const count = await messageService.getUnreadCount(userId);

      res.json({ count });
    } catch (error) {
      next(error);
    }
  }
}


export const messageController = new MessageController();
