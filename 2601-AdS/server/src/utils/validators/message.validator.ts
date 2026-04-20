import { z } from 'zod';

export const sendMessageSchema = z.object({
  body: z.object({
    receiverId: z.string().uuid(),
    content: z.string().min(1).max(5000),
    requestId: z.string().uuid().optional(),
  }),
});

export const getConversationSchema = z.object({
  params: z.object({
    userId: z.string().uuid(),
  }),
  query: z.object({
    page: z.string().regex(/^\d+$/).transform(Number).optional(),
    limit: z.string().regex(/^\d+$/).transform(Number).optional(),
  }),
});

export const markAsReadSchema = z.object({
  params: z.object({
    messageId: z.string().uuid(),
  }),
});
