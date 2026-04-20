import { z } from 'zod';

export const createReviewSchema = z.object({
  body: z.object({
    requestId: z.string().uuid('Invalid request ID'),
    rating: z.number().int().min(1).max(5),
    comment: z.string().max(2000).optional(),
  }),
});

export const getProviderReviewsSchema = z.object({
  params: z.object({
    providerId: z.string().uuid(),
  }),
  query: z.object({
    page: z.coerce.number().min(1).optional().default(1),
    limit: z.coerce.number().min(1).max(100).optional().default(20),
  }),
});
