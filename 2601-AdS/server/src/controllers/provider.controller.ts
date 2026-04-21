import { Request, Response, NextFunction } from 'express';
import { providerService } from '../services/provider.service';
import { AuthRequest } from '../middleware/auth';

export class ProviderController {
  /**
   * POST /api/providers/register
   * Register a new provider profile
   */
  async register(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const {
        serviceCategoryId,
        bio,
        locationCity,
        locationRegion,
        locationLat,
        locationLng,
        certifications,
        availabilityNotes,
      } = req.body;

      const profile = await providerService.register(req.userId!, {
        serviceCategoryId,
        bio,
        locationCity,
        locationRegion,
        locationLat,
        locationLng,
        certifications,
        availabilityNotes,
      });

      res.status(201).json({
        profile,
        message: (req as any).t('provider.registration_submitted'),
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/providers/:id
   * Get provider profile (public or owner/admin)
   */
  async getById(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;

      const profile = await providerService.getById(
        id,
        req.userId,
        req.userRole,
      );

      if (!profile) {
        res.status(404).json({
          error: {
            code: 'NOT_FOUND',
            message: (req as any).t('provider.profile_not_found'),
          },
        });
        return;
      }

      res.json({ profile });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/providers/:id
   * Update provider profile
   */
  async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const data = req.body;

      const profile = await providerService.update(id, req.userId!, data);

      res.json({ profile });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/providers/:id/resubmit
   * Resubmit rejected profile for review
   */
  async resubmit(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;

      const profile = await providerService.resubmit(id, req.userId!);

      res.json({
        profile,
        message: (req as any).t('provider.resubmitted'),
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/providers
   * Search/filter approved providers
   */
  async search(req: Request, res: Response, next: NextFunction) {
    try {
      const { categoryId, city, minRating, sort, page, limit } = req.query;

      const result = await providerService.search({
        categoryId: categoryId as string | undefined,
        city: city as string | undefined,
        minRating: minRating ? Number(minRating) : undefined,
        sort: sort as 'rating' | 'recent' | undefined,
        page: page ? Number(page) : 1,
        limit: limit ? Number(limit) : 20,
      });

      res.json(result);
    } catch (error) {
      next(error);
    }
  }
}

export const providerController = new ProviderController();
