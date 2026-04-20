import { prisma } from '../config/database';

import { RequestStatus, NotificationType } from '@prisma/client';
import { notificationService } from './notification.service';

interface CreateReviewInput {
  requestId: string;
  rating: number;
  comment?: string;
}

export class ReviewService {
  /**
   * Create a review for a completed request
   */
  async create(customerId: string, input: CreateReviewInput) {
    // Verify request exists and is completed
    const request = await prisma.serviceRequest.findUnique({
      where: { id: input.requestId },
      include: {
        provider: true,
        review: true,
      },
    });

    if (!request) {
      throw new Error('Request not found');
    }

    if (request.status !== RequestStatus.COMPLETED) {
      throw new Error('Can only review completed requests');
    }

    if (request.customerId !== customerId) {
      throw new Error('Only the customer can submit a review');
    }

    if (request.review) {
      throw new Error('Review already exists for this request');
    }

    // Create review
    const review = await prisma.review.create({
      data: {
        requestId: input.requestId,
        customerId,
        providerId: request.providerId,
        rating: input.rating,
        comment: input.comment,
      },
      include: {
        customer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        request: {
          select: {
            id: true,
            description: true,
          },
        },
      },
    });

    // Update provider's average rating and total reviews
    await this.updateProviderRating(request.providerId);

    // Create notification for provider
    await notificationService.createNotification({
      userId: request.provider.userId,
      type: NotificationType.NEW_REVIEW,
      messageEs: `Nueva reseña de ${review.customer.firstName} - ${input.rating} estrellas`,
      messageEn: `New review from ${review.customer.firstName} - ${input.rating} stars`,
      linkUrl: `/providers/${request.providerId}/reviews`,
    }).catch(err => console.error('Failed to create notification:', err));

    return review;
  }

  /**
   * Get paginated reviews for a provider
   */
  async getProviderReviews(providerId: string, page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where: { providerId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          customer: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
          request: {
            select: {
              id: true,
              description: true,
            },
          },
        },
      }),
      prisma.review.count({
        where: { providerId },
      }),
    ]);

    return {
      reviews,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Update provider's average rating and total reviews
   */
  private async updateProviderRating(providerId: string) {
    const stats = await prisma.review.aggregate({
      where: { providerId },
      _avg: {
        rating: true,
      },
      _count: {
        rating: true,
      },
    });

    await prisma.providerProfile.update({
      where: { id: providerId },
      data: {
        averageRating: stats._avg.rating || 0,
        totalReviews: stats._count.rating,
      },
    });
  }
}

export const reviewService = new ReviewService();
