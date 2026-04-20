import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { validate } from '../middleware/validation';
import { requireAuth } from '../middleware/auth';
import { registerSchema, loginSchema } from '../utils/validators/auth.validator';

const router = Router();

// Public routes
router.post('/register', validate(registerSchema), authController.register);
router.post('/login', validate(loginSchema), authController.login);
router.post('/logout', authController.logout);

// Protected routes
router.get('/me', requireAuth, authController.getMe);

export default router;
