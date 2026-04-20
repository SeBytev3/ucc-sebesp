import { Router } from 'express';
import { messageController } from '../controllers/message.controller';
import { requireAuth } from '../middleware/auth';
import { validate } from '../middleware/validation';
import { messageRateLimiter } from '../middleware/rate-limit';
import { 
  sendMessageSchema, 
  getConversationSchema, 
  markAsReadSchema 
} from '../utils/validators/message.validator';

const router = Router();

// All message routes require authentication
router.use(requireAuth);

/**
 * @openapi
 * /api/messages:
 *   post:
 *     tags: [Messages]
 *     summary: Send a message to another user
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [receiverId, content]
 *             properties:
 *               receiverId: { type: string, format: uuid }
 *               content: { type: string }
 *               requestId: { type: string, format: uuid }
 *     responses:
 *       201:
 *         description: Message sent successfully
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Message' }
 *       400: { $ref: '#/components/responses/ValidationError' }
 *       401: { $ref: '#/components/responses/UnauthorizedError' }
 *       429: { description: Too many messages sent }
 */
router.post(
  '/messages', 
  messageRateLimiter,
  validate(sendMessageSchema), 
  messageController.sendMessage
);

/**
 * @openapi
 * /api/messages/conversation/{userId}:
 *   get:
 *     tags: [Messages]
 *     summary: Get conversation with another user
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema: { type: string, format: uuid }
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *     responses:
 *       200:
 *         description: List of messages in the conversation
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 messages:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/Message' }
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     total: { type: integer }
 *                     page: { type: integer }
 *                     limit: { type: integer }
 *                     totalPages: { type: integer }
 *       401: { $ref: '#/components/responses/UnauthorizedError' }
 */
router.get(
  '/messages/conversation/:userId', 
  validate(getConversationSchema), 
  messageController.getConversation
);

/**
 * @openapi
 * /api/messages/{messageId}/read:
 *   patch:
 *     tags: [Messages]
 *     summary: Mark a message as read
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: messageId
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Message marked as read successfully
 *       401: { $ref: '#/components/responses/UnauthorizedError' }
 *       403: { $ref: '#/components/responses/ForbiddenError' }
 *       404: { $ref: '#/components/responses/NotFoundError' }
 */
router.patch(
  '/messages/:messageId/read', 
  validate(markAsReadSchema), 
  messageController.markAsRead
);

/**
 * @openapi
 * /api/messages/unread-count:
 *   get:
 *     tags: [Messages]
 *     summary: Get total unread message count for current user
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Unread message count
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 count: { type: integer }
 *       401: { $ref: '#/components/responses/UnauthorizedError' }
 */
router.get(
  '/messages/unread-count', 
  messageController.getUnreadCount
);

export default router;
