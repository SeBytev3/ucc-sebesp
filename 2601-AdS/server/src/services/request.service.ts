import { prisma } from '../config/database';
import { RequestStatus, ProviderStatus, NotificationType } from '@prisma/client';
import { notificationService } from './notification.service';

interface CreateRequestInput {
  providerId: string;
  categoryId: string;
  description: string;
}

export class RequestService {
  /**
   * Create a new service request (customer → provider)
   */
  async create(customerId: string, input: CreateRequestInput) {
    // Verify provider exists and is approved
    const provider = await prisma.providerProfile.findUnique({
      where: { id: input.providerId },
    });

    if (!provider) {
      throw new Error('Provider not found');
    }

    if (provider.status !== ProviderStatus.APPROVED) {
      throw new Error('Cannot send requests to this provider');
    }

    // Verify category exists
    const category = await prisma.serviceCategory.findUnique({
      where: { id: input.categoryId },
    });

    if (!category) {
      throw new Error('Invalid service category');
    }

    const request = await prisma.serviceRequest.create({
      data: {
        customerId,
        providerId: input.providerId,
        categoryId: input.categoryId,
        description: input.description,
        status: RequestStatus.PENDING,
      },
      include: {
        customer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        provider: {
          select: {
            id: true,
            user: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        category: {
          select: {
            nameEs: true,
            nameEn: true,
          },
        },
      },
    });

    // Create notification for provider
    await notificationService.createNotification({
      userId: provider.userId,
      type: NotificationType.REQUEST_RECEIVED,
      messageEs: `Nueva solicitud de servicio de ${request.customer.firstName}`,
      messageEn: `New service request from ${request.customer.firstName}`,
      linkUrl: `/requests/${request.id}`,
    }).catch(err => console.error('Failed to create notification:', err));

    return request;
  }

  /**
   * List requests filtered by user role (sent/received)
   */
  async listByUser(userId: string, role: 'sent' | 'received', status?: RequestStatus) {
    const where: any =
      role === 'sent' ? { customerId: userId } : { provider: { userId } };

    if (status) {
      where.status = status;
    }

    const requests = await prisma.serviceRequest.findMany({
      where,
      orderBy: { requestedAt: 'desc' },
      include: {
        customer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        provider: {
          select: {
            id: true,
            user: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        category: {
          select: {
            nameEs: true,
            nameEn: true,
          },
        },
      },
    });

    return requests;
  }

  /**
   * Provider responds to request (accept/decline)
   */
  async respond(requestId: string, providerUserId: string, action: 'accept' | 'decline', notes?: string) {
    const request = await prisma.serviceRequest.findUnique({
      where: { id: requestId },
      include: {
        provider: true,
      },
    });

    if (!request) {
      throw new Error('Request not found');
    }

    if (request.provider.userId !== providerUserId) {
      throw new Error('Not authorized to respond to this request');
    }

    if (request.status !== RequestStatus.PENDING) {
      throw new Error('Request already has a response');
    }

    const newStatus = action === 'accept' ? RequestStatus.ACCEPTED : RequestStatus.DECLINED;

    const updated = await prisma.serviceRequest.update({
      where: { id: requestId },
      data: {
        status: newStatus,
        providerResponseNotes: notes,
        respondedAt: new Date(),
      },
      include: {
        customer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        provider: {
          select: {
            id: true,
            user: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        category: {
          select: {
            nameEs: true,
            nameEn: true,
          },
        },
      },
    });

    // Create notification for customer
    const notificationType =
      action === 'accept' ? NotificationType.REQUEST_ACCEPTED : NotificationType.REQUEST_DECLINED;

    await notificationService.createNotification({
      userId: request.customerId,
      type: notificationType,
      messageEs:
        action === 'accept'
          ? `Tu solicitud ha sido aceptada por ${updated.provider.user.firstName}`
          : `Tu solicitud ha sido declinada por ${updated.provider.user.firstName}`,
      messageEn:
        action === 'accept'
          ? `Your request has been accepted by ${updated.provider.user.firstName}`
          : `Your request has been declined by ${updated.provider.user.firstName}`,
      linkUrl: `/requests/${requestId}`,
    }).catch(err => console.error('Failed to create notification:', err));

    return updated;
  }

  /**
   * Mark request as completed (enables review)
   */
  async complete(requestId: string, userId: string) {
    const request = await prisma.serviceRequest.findUnique({
      where: { id: requestId },
      include: {
        provider: true,
      },
    });

    if (!request) {
      throw new Error('Request not found');
    }

    // Either customer or provider can mark as complete
    const isCustomer = request.customerId === userId;
    const isProvider = request.provider.userId === userId;

    if (!isCustomer && !isProvider) {
      throw new Error('Not authorized to complete this request');
    }

    if (request.status !== RequestStatus.ACCEPTED) {
      throw new Error('Can only complete accepted requests');
    }

    const updated = await prisma.serviceRequest.update({
      where: { id: requestId },
      data: {
        status: RequestStatus.COMPLETED,
        completedAt: new Date(),
      },
      include: {
        customer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        provider: {
          select: {
            id: true,
            user: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        category: {
          select: {
            nameEs: true,
            nameEn: true,
          },
        },
      },
    });

    return updated;
  }

  /**
   * Cancel a request (customer only)
   */
  async cancel(requestId: string, customerId: string) {
    const request = await prisma.serviceRequest.findUnique({
      where: { id: requestId },
    });

    if (!request) {
      throw new Error('Request not found');
    }

    if (request.customerId !== customerId) {
      throw new Error('Not authorized to cancel this request');
    }

    if (request.status !== RequestStatus.PENDING) {
      throw new Error('Can only cancel pending requests');
    }

    const updated = await prisma.serviceRequest.update({
      where: { id: requestId },
      data: {
        status: RequestStatus.CANCELLED,
      },
      include: {
        customer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        provider: {
          select: {
            id: true,
            user: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        category: {
          select: {
            nameEs: true,
            nameEn: true,
          },
        },
      },
    });

    return updated;
  }
}

export const requestService = new RequestService();
