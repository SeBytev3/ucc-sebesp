import { Response, NextFunction } from 'express';
import { adminService } from '../services/admin.service';
import { AuthRequest } from '../middleware/auth';

export class AdminController {
  /**
   * GET /api/admin/providers/pending
   * List all pending provider registrations
   */
  async getPendingProviders(_req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const profiles = await adminService.getPendingProviders();
      res.json({ profiles });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /api/admin/providers/:id/approve
   * Approve a provider profile
   */
  async approveProvider(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;

      const profile = await adminService.approveProvider(id, req.userId!);

      res.json({
        profile,
        message: (req as any).t('provider.approved'),
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /api/admin/providers/:id/reject
   * Reject a provider profile with reason
   */
  async rejectProvider(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const { reason } = req.body;

      const profile = await adminService.rejectProvider(id, req.userId!, reason);

      res.json({
        profile,
        message: (req as any).t('provider.rejected'),
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /api/admin/providers/:id/deactivate
   * Soft-deactivate a provider
   */
  async deactivateProvider(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;

      const profile = await adminService.deactivateProvider(id, req.userId!);

      res.json({
        profile,
        message: (req as any).t('provider.deactivated'),
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /api/admin/providers/:id/commission
   * Set custom commission rate for a provider
   */
  async setCommissionRate(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const { commissionRate } = req.body;

      const updated = await adminService.setCommissionRate(id, req.userId!, commissionRate);

      res.json({
        updated,
        message: (req as any).t('provider.commission_updated'),
      });
    } catch (error) {
      next(error);
    }
  }
}

export const adminController = new AdminController();
