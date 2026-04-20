import { Router } from 'express';
import { requestController } from '../controllers/request.controller';
import { validate } from '../middleware/validation';
import { requireAuth } from '../middleware/auth';
import {
  createRequestSchema,
  respondRequestSchema,
  listRequestsSchema,
} from '../utils/validators/request.validator';

const router = Router();

/**
 * @openapi
 * /api/requests:
 *   post:
 *     tags: [Requests]
 *     summary: Create a new service request
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [providerId, categoryId, description]
 *             properties:
 *               providerId: { type: string, format: uuid }
 *               categoryId: { type: string, format: uuid }
 *               description: { type: string }
 *     responses:
 *       201:
 *         description: Request created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 request: { $ref: '#/components/schemas/ServiceRequest' }
 *       400: { $ref: '#/components/responses/ValidationError' }
 *       401: { $ref: '#/components/responses/UnauthorizedError' }
 */
router.post(
  '/requests',
  requireAuth,
  validate(createRequestSchema),
  requestController.create,
);

/**
 * @openapi
 * /api/requests:
 *   get:
 *     tags: [Requests]
 *     summary: List service requests for the current user
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: role
 *         required: true
 *         schema: { type: string, enum: [sent, received] }
 *         description: 'sent' for customer requests, 'received' for provider requests
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [PENDING, ACCEPTED, DECLINED, COMPLETED, CANCELLED] }
 *     responses:
 *       200:
 *         description: List of service requests
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 requests:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/ServiceRequest' }
 *       401: { $ref: '#/components/responses/UnauthorizedError' }
 */
router.get(
  '/requests',
  requireAuth,
  validate(listRequestsSchema),
  requestController.listByUser,
);

/**
 * @openapi
 * /api/requests/{id}/respond:
 *   patch:
 *     tags: [Requests]
 *     summary: Respond to a service request (Provider only)
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [action]
 *             properties:
 *               action: { type: string, enum: [accept, decline] }
 *               notes: { type: string }
 *     responses:
 *       200:
 *         description: Request responded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 request: { $ref: '#/components/schemas/ServiceRequest' }
 *       400: { $ref: '#/components/responses/ValidationError' }
 *       401: { $ref: '#/components/responses/UnauthorizedError' }
 *       403: { $ref: '#/components/responses/ForbiddenError' }
 *       404: { $ref: '#/components/responses/NotFoundError' }
 */
router.patch(
  '/requests/:id/respond',
  requireAuth,
  validate(respondRequestSchema),
  requestController.respond,
);

/**
 * @openapi
 * /api/requests/{id}/complete:
 *   patch:
 *     tags: [Requests]
 *     summary: Mark a request as completed
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Request marked as completed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 request: { $ref: '#/components/schemas/ServiceRequest' }
 *       401: { $ref: '#/components/responses/UnauthorizedError' }
 *       403: { $ref: '#/components/responses/ForbiddenError' }
 *       404: { $ref: '#/components/responses/NotFoundError' }
 */
router.patch('/requests/:id/complete', requireAuth, requestController.complete);

/**
 * @openapi
 * /api/requests/{id}/cancel:
 *   patch:
 *     tags: [Requests]
 *     summary: Cancel a service request
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Request cancelled successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 request: { $ref: '#/components/schemas/ServiceRequest' }
 *       401: { $ref: '#/components/responses/UnauthorizedError' }
 *       403: { $ref: '#/components/responses/ForbiddenError' }
 *       404: { $ref: '#/components/responses/NotFoundError' }
 */
router.patch('/requests/:id/cancel', requireAuth, requestController.cancel);

export default router;
