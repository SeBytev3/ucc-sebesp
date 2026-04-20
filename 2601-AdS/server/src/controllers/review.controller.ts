import { Response } from 'express';
import { reviewService } from '../services/review.service';
import { AuthRequest } from '../middleware/auth';

export class ReviewController {
  /**
   * POST /api/reviews
   * Create a review for a completed request
   */
  async create(req: AuthRequest, res: Response) {
    const { requestId, rating, comment } = req.body;

    const review = await reviewService.create(req.userId!, {
      requestId,
      rating,
      comment,
    });

    res.status(201).json({ review });
  }

  /**
   * GET /api/reviews/provider/:providerId
   * Get paginated reviews for a provider (public)
   */
  async getProviderReviews(req: AuthRequest, res: Response) {
    const providerId = req.params.providerId as string;
    const page = req.query.page as unknown as number;
    const limit = req.query.limit as unknown as number;

    const result = await reviewService.getProviderReviews(
      providerId,
      page,
      limit,
    );

    res.json(result);
  }
}

export const reviewController = new ReviewController();
