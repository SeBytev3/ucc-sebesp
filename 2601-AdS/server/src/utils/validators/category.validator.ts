import { z } from 'zod';

export const createCategorySchema = z.object({
  body: z.object({
    nameEs: z.string().min(1).max(100),
    nameEn: z.string().min(1).max(100),
    descriptionEs: z.string().optional(),
    descriptionEn: z.string().optional(),
  }),
});

export const updateCategorySchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
  body: z.object({
    nameEs: z.string().min(1).max(100).optional(),
    nameEn: z.string().min(1).max(100).optional(),
    descriptionEs: z.string().optional(),
    descriptionEn: z.string().optional(),
    isActive: z.boolean().optional(),
  }),
});
