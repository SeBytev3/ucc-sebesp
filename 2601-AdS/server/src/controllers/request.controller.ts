import { Response, NextFunction } from 'express';
import { RequestStatus } from '@prisma/client';
import { requestService } from '../services/request.service';
import { AuthRequest } from '../middleware/auth';

export class RequestController {
  /**
   * POST /api/requests
   * Create a new service request
   */
  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { providerId, categoryId, description } = req.body;

      const request = await requestService.create(req.userId!, {
        providerId,
        categoryId,
        description,
      });

      res.status(201).json({ request });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/requests
   * List requests by user role
   */
  async listByUser(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { role, status } = req.query;

      const requests = await requestService.listByUser(
        req.userId!,
        role as 'sent' | 'received',
        status as RequestStatus | undefined,
      );

      res.json({ requests });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /api/requests/:id/respond
   * Provider responds to request
   */
  async respond(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const { action, notes } = req.body;

      const request = await requestService.respond(
        id,
        req.userId!,
        action,
        notes,
      );

      res.json({ request });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /api/requests/:id/complete
   * Mark request as completed
   */
  async complete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;

      const request = await requestService.complete(id, req.userId!);

      res.json({ request });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /api/requests/:id/cancel
   * Cancel a request
   */
  async cancel(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;

      const request = await requestService.cancel(id, req.userId!);

      res.json({ request });
    } catch (error) {
      next(error);
    }
  }
}

export const requestController = new RequestController();
