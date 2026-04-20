import { Router } from 'express';
import { providerController } from '../controllers/provider.controller';
import { validate } from '../middleware/validation';
import { requireAuth } from '../middleware/auth';
import {
  registerProviderSchema,
  updateProviderSchema,
  searchProvidersSchema,
} from '../utils/validators/provider.validator';

const router = Router();

/**
 * @openapi
 * /api/providers:
 *   get:
 *     tags: [Providers]
 *     summary: Search for approved providers
 *     parameters:
 *       - in: query
 *         name: categoryId
 *         schema: { type: string, format: uuid }
 *       - in: query
 *         name: city
 *         schema: { type: string }
 *       - in: query
 *         name: minRating
 *         schema: { type: number, minimum: 0, maximum: 5 }
 *       - in: query
 *         name: sort
 *         schema: { type: string, enum: [rating, recent] }
 *       - in: query
 *         name: page
 *         schema: { type: integer, minimum: 1, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, minimum: 1, maximum: 100, default: 20 }
 *     responses:
 *       200:
 *         description: Search results
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 providers:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/ProviderProfile' }
 *                 total: { type: integer }
 *                 page: { type: integer }
 *                 limit: { type: integer }
 */
router.get('/providers', validate(searchProvidersSchema), providerController.search);

/**
 * @openapi
 * /api/providers/{id}:
 *   get:
 *     tags: [Providers]
 *     summary: Get a provider profile by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Provider profile details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 profile: { $ref: '#/components/schemas/ProviderProfile' }
 *       404: { $ref: '#/components/responses/NotFoundError' }
 */
router.get('/providers/:id', providerController.getById);

/**
 * @openapi
 * /api/providers/register:
 *   post:
 *     tags: [Providers]
 *     summary: Register as a service provider
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [serviceCategoryId]
 *             properties:
 *               serviceCategoryId: { type: string, format: uuid }
 *               bio: { type: string }
 *               locationCity: { type: string }
 *               locationRegion: { type: string }
 *               locationLat: { type: number }
 *               locationLng: { type: number }
 *               certifications: { type: array, items: { type: string } }
 *               availabilityNotes: { type: string }
 *     responses:
 *       201:
 *         description: Provider profile submitted for approval
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 profile: { $ref: '#/components/schemas/ProviderProfile' }
 *                 message: { type: string }
 *       400: { $ref: '#/components/responses/ValidationError' }
 *       401: { $ref: '#/components/responses/UnauthorizedError' }
 */
router.post(
  '/providers/register',
  requireAuth,
  validate(registerProviderSchema),
  providerController.register,
);

/**
 * @openapi
 * /api/providers/{id}:
 *   put:
 *     tags: [Providers]
 *     summary: Update provider profile
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
 *             properties:
 *               serviceCategoryId: { type: string, format: uuid }
 *               bio: { type: string }
 *               locationCity: { type: string }
 *               locationRegion: { type: string }
 *               locationLat: { type: number }
 *               locationLng: { type: number }
 *               certifications: { type: array, items: { type: string } }
 *               availabilityNotes: { type: string }
 *     responses:
 *       200:
 *         description: Provider profile updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 profile: { $ref: '#/components/schemas/ProviderProfile' }
 *       400: { $ref: '#/components/responses/ValidationError' }
 *       401: { $ref: '#/components/responses/UnauthorizedError' }
 *       403: { $ref: '#/components/responses/ForbiddenError' }
 *       404: { $ref: '#/components/responses/NotFoundError' }
 */
router.put(
  '/providers/:id',
  requireAuth,
  validate(updateProviderSchema),
  providerController.update,
);

/**
 * @openapi
 * /api/providers/{id}/resubmit:
 *   post:
 *     tags: [Providers]
 *     summary: Resubmit a rejected profile for review
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Profile resubmitted successfully
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
router.post('/providers/:id/resubmit', requireAuth, providerController.resubmit);

export default router;
