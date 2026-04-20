import { Router } from 'express';
import { adminController } from '../controllers/admin.controller';
import { validate } from '../middleware/validation';
import { requireAuth, requireRole } from '../middleware/auth';
import {
  approveProviderSchema,
  rejectProviderSchema,
  deactivateProviderSchema,
  setCommissionRateSchema,
} from '../utils/validators/admin.validator';

const router = Router();

// All admin routes require authentication + ADMIN role
router.use(requireAuth);
router.use(requireRole('ADMIN'));

/**
 * @openapi
 * /api/admin/providers/pending:
 *   get:
 *     tags: [Admin, Providers]
 *     summary: List all pending provider registrations
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: List of pending provider profiles
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 profiles:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/ProviderProfile' }
 *       401: { $ref: '#/components/responses/UnauthorizedError' }
 *       403: { $ref: '#/components/responses/ForbiddenError' }
 */
router.get(
  '/providers/pending',
  adminController.getPendingProviders,
);

/**
 * @openapi
 * /api/admin/providers/{id}/approve:
 *   patch:
 *     tags: [Admin, Providers]
 *     summary: Approve a provider profile
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Provider approved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 profile: { $ref: '#/components/schemas/ProviderProfile' }
 *                 message: { type: string }
 *       401: { $ref: '#/components/responses/UnauthorizedError' }
 *       403: { $ref: '#/components/responses/ForbiddenError' }
 *       404: { $ref: '#/components/responses/NotFoundError' }
 */
router.patch(
  '/providers/:id/approve',
  validate(approveProviderSchema),
  adminController.approveProvider,
);

/**
 * @openapi
 * /api/admin/providers/{id}/reject:
 *   patch:
 *     tags: [Admin, Providers]
 *     summary: Reject a provider profile
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
 *             required: [reason]
 *             properties:
 *               reason: { type: string }
 *     responses:
 *       200:
 *         description: Provider rejected successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 profile: { $ref: '#/components/schemas/ProviderProfile' }
 *                 message: { type: string }
 *       401: { $ref: '#/components/responses/UnauthorizedError' }
 *       403: { $ref: '#/components/responses/ForbiddenError' }
 *       404: { $ref: '#/components/responses/NotFoundError' }
 */
router.patch(
  '/providers/:id/reject',
  validate(rejectProviderSchema),
  adminController.rejectProvider,
);

/**
 * @openapi
 * /api/admin/providers/{id}/deactivate:
 *   patch:
 *     tags: [Admin, Providers]
 *     summary: Deactivate a provider profile
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Provider deactivated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 profile: { $ref: '#/components/schemas/ProviderProfile' }
 *                 message: { type: string }
 *       401: { $ref: '#/components/responses/UnauthorizedError' }
 *       403: { $ref: '#/components/responses/ForbiddenError' }
 *       404: { $ref: '#/components/responses/NotFoundError' }
 */
router.patch(
  '/providers/:id/deactivate',
  validate(deactivateProviderSchema),
  adminController.deactivateProvider,
);

/**
 * @openapi
 * /api/admin/providers/{id}/commission:
 *   patch:
 *     tags: [Admin, Providers]
 *     summary: Set commission rate for a provider
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
 *             required: [commissionRate]
 *             properties:
 *               commissionRate: { type: number }
 *     responses:
 *       200:
 *         description: Commission rate updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 updated: { $ref: '#/components/schemas/ProviderProfile' }
 *                 message: { type: string }
 *       401: { $ref: '#/components/responses/UnauthorizedError' }
 *       403: { $ref: '#/components/responses/ForbiddenError' }
 *       404: { $ref: '#/components/responses/NotFoundError' }
 */
router.patch(
  '/providers/:id/commission',
  validate(setCommissionRateSchema),
  adminController.setCommissionRate,
);

export default router;
