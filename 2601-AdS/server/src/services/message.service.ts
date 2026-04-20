import { prisma } from '../config/database';
import { notificationService } from './notification.service';
import { NotificationType } from '@prisma/client';

export interface SendMessageInput {
  senderId: string;
  receiverId: string;
  content: string;
  requestId?: string;
}

class MessageService {
  /**
   * Send a message from one user to another
   */
  async sendMessage(input: SendMessageInput) {
    const { senderId, receiverId, content, requestId } = input;

    if (requestId) {
      const request = await prisma.serviceRequest.findUnique({
        where: { id: requestId },
      });

      if (!request) {
        throw new Error('Service request not found');
      }
    }

    const message = await prisma.message.create({
      data: {
        senderId,
        receiverId,
        content,
        requestId,
      },
      include: {
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    // Create notification for receiver
    await notificationService.createNotification({
      userId: receiverId,
      type: NotificationType.NEW_MESSAGE,
      messageEs: `Has recibido un nuevo mensaje de ${message.sender.firstName}`,
      messageEn: `You have received a new message from ${message.sender.firstName}`,
      linkUrl: requestId ? `/requests/${requestId}/messages` : `/messages/${senderId}`,
    }).catch(err => {
      console.error('Failed to create notification for message:', err);
      // We don't fail the message sending if notification fails
    });

    return message;
  }

  /**
   * Get conversation between two users
   */
  async getConversation(userId: string, otherUserId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: userId, receiverId: otherUserId },
          { senderId: otherUserId, receiverId: userId },
        ],
      },
      orderBy: {
        createdAt: 'desc',
      },
      skip,
      take: limit,
      include: {
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    const total = await prisma.message.count({
      where: {
        OR: [
          { senderId: userId, receiverId: otherUserId },
          { senderId: otherUserId, receiverId: userId },
        ],
      },
    });

    return {
      messages,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Mark message as read
   */
  async markAsRead(messageId: string, userId: string) {
    const message = await prisma.message.findUnique({
      where: { id: messageId },
    });

    if (!message) {
      throw new Error('Message not found');
    }

    if (message.receiverId !== userId) {
      throw new Error('Not authorized to mark this message as read');
    }

    return prisma.message.update({
      where: { id: messageId },
      data: { isRead: true },
    });
  }

  /**
   * Get unread message count for a user
   */
  async getUnreadCount(userId: string) {
    return prisma.message.count({
      where: {
        receiverId: userId,
        isRead: false,
      },
    });
  }
}

export const messageService = new MessageService();
