import { Response } from 'express';
import { uploadService } from '../services/upload.service';
import { prisma } from '../config/database';
import { AuthRequest } from '../middleware/auth';

class UploadController {
  async uploadPortfolioImage(req: AuthRequest, res: Response): Promise<void> {
    try {
      const providerId = req.params.id as string;
      const userId = req.userId!;
      const file = req.file;

      if (!file) {
        res.status(400).json({ error: 'No file uploaded' });
        return;
      }

      // Verify profile ownership or admin role
      const profile = await prisma.providerProfile.findUnique({
        where: { id: providerId },
      });

      if (!profile) {
        res.status(404).json({ error: 'Provider profile not found' });
        return;
      }

      if (profile.userId !== userId && req.userRole !== 'ADMIN') {
        res.status(403).json({ error: 'Not authorized to update this portfolio' });
        return;
      }

      const caption = req.body.caption;
      const portfolioItem = await uploadService.uploadPortfolioImage(providerId, file, caption);

      res.status(201).json(portfolioItem);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async deletePortfolioImage(req: AuthRequest, res: Response): Promise<void> {
    try {
      const providerId = req.params.id as string;
      const imageId = req.params.imageId as string;
      const userId = req.userId!;

      // Verify profile ownership or admin role
      const profile = await prisma.providerProfile.findUnique({
        where: { id: providerId },
      });

      if (!profile) {
        res.status(404).json({ error: 'Provider profile not found' });
        return;
      }

      if (profile.userId !== userId && req.userRole !== 'ADMIN') {
        res.status(403).json({ error: 'Not authorized to update this portfolio' });
        return;
      }

      await uploadService.deletePortfolioImage(imageId, providerId);

      res.status(204).send();
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
}

export const uploadController = new UploadController();
