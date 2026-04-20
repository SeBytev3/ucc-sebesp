import { z } from 'zod';

export const approveProviderSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
});

export const rejectProviderSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
  body: z.object({
    reason: z.string().min(1).max(500, 'Rejection reason too long'),
  }),
});

export const deactivateProviderSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
});

export const setCommissionRateSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
  body: z.object({
    commissionRate: z.coerce.number().min(0).max(100),
  }),
});
