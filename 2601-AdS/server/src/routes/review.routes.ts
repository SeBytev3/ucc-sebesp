import { Router } from 'express';
import { reviewController } from '../controllers/review.controller';
import { validate } from '../middleware/validation';
import { requireAuth } from '../middleware/auth';
import {
  createReviewSchema,
  getProviderReviewsSchema,
} from '../utils/validators/review.validator';

const router = Router();

/**
 * @openapi
 * /api/reviews/provider/{providerId}:
 *   get:
 *     tags: [Reviews]
 *     summary: Get reviews for a specific provider
 *     parameters:
 *       - in: path
 *         name: providerId
 *         required: true
 *         schema: { type: string, format: uuid }
 *       - in: query
 *         name: page
 *         schema: { type: integer, minimum: 1, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, minimum: 1, maximum: 100, default: 20 }
 *     responses:
 *       200:
 *         description: Paginated list of reviews
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 reviews:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/Review' }
 *                 total: { type: integer }
 *                 page: { type: integer }
 *                 limit: { type: integer }
 */
router.get(
  '/reviews/provider/:providerId',
  validate(getProviderReviewsSchema),
  reviewController.getProviderReviews,
);

/**
 * @openapi
 * /api/reviews:
 *   post:
 *     tags: [Reviews]
 *     summary: Create a review for a completed service request
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [requestId, rating]
 *             properties:
 *               requestId: { type: string, format: uuid }
 *               rating: { type: integer, minimum: 1, maximum: 5 }
 *               comment: { type: string }
 *     responses:
 *       201:
 *         description: Review created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 review: { $ref: '#/components/schemas/Review' }
 *       400: { $ref: '#/components/responses/ValidationError' }
 *       401: { $ref: '#/components/responses/UnauthorizedError' }
 *       403: { $ref: '#/components/responses/ForbiddenError' }
 *       404: { $ref: '#/components/responses/NotFoundError' }
 */
router.post(
  '/reviews',
  requireAuth,
  validate(createReviewSchema),
  reviewController.create,
);

export default router;
