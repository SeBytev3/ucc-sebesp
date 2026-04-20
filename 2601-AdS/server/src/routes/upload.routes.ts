import { Router } from 'express';
import multer from 'multer';
import { uploadController } from '../controllers/upload.controller';
import { requireAuth } from '../middleware/auth';

const router = Router();

// Configure multer to store files in memory before processing
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (_req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPG, PNG and WebP are allowed.'));
    }
  },
});

// Routes require authentication
router.use(requireAuth);

/**
 * @openapi
 * /api/providers/{id}/portfolio:
 *   post:
 *     tags: [Portfolio]
 *     summary: Upload an image to the provider's portfolio
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *         description: Provider profile ID
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: Image file (max 5MB, JPG/PNG/WebP)
 *               caption:
 *                 type: string
 *                 description: Optional caption for the image
 *     responses:
 *       201:
 *         description: Image uploaded successfully
 *       400: { $ref: '#/components/responses/ValidationError' }
 *       401: { $ref: '#/components/responses/UnauthorizedError' }
 *       403: { $ref: '#/components/responses/ForbiddenError' }
 *       404: { $ref: '#/components/responses/NotFoundError' }
 */
router.post(
  '/providers/:id/portfolio', 
  upload.single('image'), 
  uploadController.uploadPortfolioImage
);

/**
 * @openapi
 * /api/providers/{id}/portfolio/{imageId}:
 *   delete:
 *     tags: [Portfolio]
 *     summary: Delete a portfolio image
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *         description: Provider profile ID
 *       - in: path
 *         name: imageId
 *         required: true
 *         schema: { type: string, format: uuid }
 *         description: Portfolio image ID
 *     responses:
 *       204:
 *         description: Image deleted successfully
 *       401: { $ref: '#/components/responses/UnauthorizedError' }
 *       403: { $ref: '#/components/responses/ForbiddenError' }
 *       404: { $ref: '#/components/responses/NotFoundError' }
 */
router.delete(
  '/providers/:id/portfolio/:imageId', 
  uploadController.deletePortfolioImage
);

export default router;
