import { z } from 'zod';

export const createRequestSchema = z.object({
  body: z.object({
    providerId: z.string().uuid('Invalid provider ID'),
    categoryId: z.string().uuid('Invalid category ID'),
    description: z.string().min(10).max(2000),
  }),
});

export const respondRequestSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
  body: z.object({
    action: z.enum(['accept', 'decline']),
    notes: z.string().max(1000).optional(),
  }),
});

export const listRequestsSchema = z.object({
  query: z.object({
    role: z.enum(['sent', 'received']),
    status: z.enum(['PENDING', 'ACCEPTED', 'DECLINED', 'COMPLETED', 'CANCELLED']).optional(),
  }),
});
