import { Response, NextFunction } from 'express';
import { reviewService } from '../services/review.service';
import { AuthRequest } from '../middleware/auth';

export class ReviewController {
  /**
   * POST /api/reviews
   * Create a review for a completed request
   */
  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { requestId, rating, comment } = req.body;

      const review = await reviewService.create(req.userId!, {
        requestId,
        rating,
        comment,
      });

      res.status(201).json({ review });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/reviews/provider/:providerId
   * Get paginated reviews for a provider (public)
   */
  async getProviderReviews(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const providerId = req.params.providerId as string;
      const page = req.query.page as unknown as number;
      const limit = req.query.limit as unknown as number;

      const result = await reviewService.getProviderReviews(
        providerId,
        page,
        limit,
      );

      res.json(result);
    } catch (error) {
      next(error);
    }
  }
}

export const reviewController = new ReviewController();
