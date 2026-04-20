import { Router } from 'express';
import { categoryController } from '../controllers/category.controller';
import { validate } from '../middleware/validation';
import { requireAuth, requireRole } from '../middleware/auth';
import { createCategorySchema, updateCategorySchema } from '../utils/validators/category.validator';

const router = Router();

// Public route
router.get('/categories', categoryController.listActive);

// Admin routes
router.get('/admin/categories', requireAuth, requireRole('ADMIN'), categoryController.listAll);
router.post(
  '/admin/categories',
  requireAuth,
  requireRole('ADMIN'),
  validate(createCategorySchema),
  categoryController.create,
);
router.patch(
  '/admin/categories/:id',
  requireAuth,
  requireRole('ADMIN'),
  validate(updateCategorySchema),
  categoryController.update,
);

export default router;
