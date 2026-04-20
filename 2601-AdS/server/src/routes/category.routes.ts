import { Router } from 'express';
import { categoryController } from '../controllers/category.controller';
import { validate } from '../middleware/validation';
import { requireAuth, requireRole } from '../middleware/auth';
import { createCategorySchema, updateCategorySchema } from '../utils/validators/category.validator';

const router = Router();

/**
 * @openapi
 * /api/categories:
 *   get:
 *     tags: [Categories]
 *     summary: List all active categories
 *     description: Returns a list of categories that are marked as active. Results are localized based on the user's language preference or the Accept-Language header.
 *     responses:
 *       200:
 *         description: List of categories
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 categories:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Category'
 */
router.get('/categories', categoryController.listActive);

/**
 * @openapi
 * /api/admin/categories:
 *   get:
 *     tags: [Admin, Categories]
 *     summary: List all categories (Admin)
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: List of all categories
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 categories:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Category'
 *       401: { $ref: '#/components/responses/UnauthorizedError' }
 *       403: { $ref: '#/components/responses/ForbiddenError' }
 */
router.get('/admin/categories', requireAuth, requireRole('ADMIN'), categoryController.listAll);

/**
 * @openapi
 * /api/admin/categories:
 *   post:
 *     tags: [Admin, Categories]
 *     summary: Create a new category (Admin)
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [nameEs, nameEn]
 *             properties:
 *               nameEs: { type: string }
 *               nameEn: { type: string }
 *               descriptionEs: { type: string }
 *               descriptionEn: { type: string }
 *     responses:
 *       201:
 *         description: Category created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 category: { $ref: '#/components/schemas/Category' }
 *       400: { $ref: '#/components/responses/ValidationError' }
 *       401: { $ref: '#/components/responses/UnauthorizedError' }
 *       403: { $ref: '#/components/responses/ForbiddenError' }
 */
router.post(
  '/admin/categories',
  requireAuth,
  requireRole('ADMIN'),
  validate(createCategorySchema),
  categoryController.create,
);

/**
 * @openapi
 * /api/admin/categories/{id}:
 *   patch:
 *     tags: [Admin, Categories]
 *     summary: Update an existing category (Admin)
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nameEs: { type: string }
 *               nameEn: { type: string }
 *               descriptionEs: { type: string }
 *               descriptionEn: { type: string }
 *               isActive: { type: boolean }
 *     responses:
 *       200:
 *         description: Category updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 category: { $ref: '#/components/schemas/Category' }
 *       400: { $ref: '#/components/responses/ValidationError' }
 *       401: { $ref: '#/components/responses/UnauthorizedError' }
 *       403: { $ref: '#/components/responses/ForbiddenError' }
 *       404: { $ref: '#/components/responses/NotFoundError' }
 */
router.patch(
  '/admin/categories/:id',
  requireAuth,
  requireRole('ADMIN'),
  validate(updateCategorySchema),
  categoryController.update,
);

export default router;
