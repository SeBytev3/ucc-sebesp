import { Router } from 'express';
import { notificationController } from '../controllers/notification.controller';
import { requireAuth } from '../middleware/auth';

const router = Router();

// All notification routes require authentication
router.use(requireAuth);

/**
 * @openapi
 * /api/notifications:
 *   get:
 *     tags: [Notifications]
 *     summary: Get all notifications for current user
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: unread
 *         schema: { type: boolean, default: false }
 *         description: Filter to only return unread notifications
 *     responses:
 *       200:
 *         description: List of notifications
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items: { $ref: '#/components/schemas/Notification' }
 *       401: { $ref: '#/components/responses/UnauthorizedError' }
 */
router.get('/notifications', notificationController.getNotifications);

/**
 * @openapi
 * /api/notifications/read-all:
 *   patch:
 *     tags: [Notifications]
 *     summary: Mark all notifications as read for current user
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       204:
 *         description: All notifications marked as read
 *       401: { $ref: '#/components/responses/UnauthorizedError' }
 */
router.patch('/notifications/read-all', notificationController.markAllAsRead);

/**
 * @openapi
 * /api/notifications/{id}/read:
 *   patch:
 *     tags: [Notifications]
 *     summary: Mark a single notification as read
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       204:
 *         description: Notification marked as read
 *       401: { $ref: '#/components/responses/UnauthorizedError' }
 *       403: { $ref: '#/components/responses/ForbiddenError' }
 *       404: { $ref: '#/components/responses/NotFoundError' }
 */
router.patch('/notifications/:id/read', notificationController.markAsRead);

/**
 * @openapi
 * /api/notifications/{id}:
 *   delete:
 *     tags: [Notifications]
 *     summary: Delete a notification
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       204:
 *         description: Notification deleted
 *       401: { $ref: '#/components/responses/UnauthorizedError' }
 *       403: { $ref: '#/components/responses/ForbiddenError' }
 *       404: { $ref: '#/components/responses/NotFoundError' }
 */
router.delete('/notifications/:id', notificationController.deleteNotification);

export default router;
