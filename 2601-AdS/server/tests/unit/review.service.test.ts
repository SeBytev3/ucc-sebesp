import { prismaMock } from '../prisma.mock';
import { reviewService } from '../../src/services/review.service';
import { RequestStatus } from '@prisma/client';

describe('ReviewService', () => {
  const mockCustomerId = 'customer-123';
  const mockRequestId = 'request-456';
  const mockProviderId = 'provider-789';
  const mockUserId = 'user-000';

  describe('create', () => {
    const input = {
      requestId: mockRequestId,
      rating: 5,
      comment: 'Excellent service!',
    };

    it('should successfully create a review and update provider rating', async () => {
      prismaMock.serviceRequest.findUnique.mockResolvedValue({
        id: mockRequestId,
        status: RequestStatus.COMPLETED,
        customerId: mockCustomerId,
        providerId: mockProviderId,
        provider: { userId: mockUserId },
        review: null,
      } as any);

      const mockReview = {
        id: 'review-1',
        ...input,
        customerId: mockCustomerId,
        providerId: mockProviderId,
        customer: { firstName: 'John' },
        request: { description: 'Task' },
      };
      prismaMock.review.create.mockResolvedValue(mockReview as any);

      prismaMock.review.aggregate.mockResolvedValue({
        _avg: { rating: 4.5 },
        _count: { rating: 10 },
      } as any);

      const result = await reviewService.create(mockCustomerId, input);

      expect(result.id).toBe('review-1');
      expect(prismaMock.providerProfile.update).toHaveBeenCalledWith(expect.objectContaining({
        where: { id: mockProviderId },
        data: { averageRating: 4.5, totalReviews: 10 }
      }));
      expect(prismaMock.notification.create).toHaveBeenCalled();
    });

    it('should throw error if request not found', async () => {
      prismaMock.serviceRequest.findUnique.mockResolvedValue(null);
      await expect(reviewService.create(mockCustomerId, input)).rejects.toThrow('Request not found');
    });

    it('should throw if request is not completed', async () => {
      prismaMock.serviceRequest.findUnique.mockResolvedValue({
        status: RequestStatus.PENDING,
        customerId: mockCustomerId,
      } as any);
      await expect(reviewService.create(mockCustomerId, input)).rejects.toThrow('Can only review completed requests');
    });
  });

  describe('getProviderReviews', () => {
    it('should return paginated reviews', async () => {
      prismaMock.review.findMany.mockResolvedValue([{ id: '1', rating: 5 } as any]);
      prismaMock.review.count.mockResolvedValue(1);

      const result = await reviewService.getProviderReviews(mockProviderId, 1, 10);

      expect(result.reviews).toHaveLength(1);
      expect(result.pagination.total).toBe(1);
    });
  });
});
