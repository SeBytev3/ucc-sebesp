import { Request, Response, NextFunction } from 'express';
import { categoryService } from '../services/category.service';
import { AuthRequest } from '../middleware/auth';
import { localizeArray } from '../utils/i18n-utils';

export class CategoryController {
  /**
   * GET /api/categories
   * List active categories (public)
   */
  async listActive(req: Request, res: Response, next: NextFunction) {
    try {
      const categories = await categoryService.listActive();
      const lng = (req as any).language || req.headers['accept-language']?.slice(0, 2) || 'es';
      
      res.json({ 
        categories: localizeArray(categories, lng, ['name', 'description']) 
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/admin/categories
   * List all categories including inactive (admin)
   */
  async listAll(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const categories = await categoryService.listAll();
      const lng = (req as any).language || 'es';

      res.json({ 
        categories: localizeArray(categories, lng, ['name', 'description']) 
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/admin/categories
   * Create new category (admin)
   */
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const { nameEs, nameEn, descriptionEs, descriptionEn } = req.body;

      const category = await categoryService.create({
        nameEs,
        nameEn,
        descriptionEs,
        descriptionEn,
      });

      res.status(201).json({ category });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /api/admin/categories/:id
   * Update category (admin)
   */
  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const data = req.body;

      const category = await categoryService.update(id, data);
      res.json({ category });
    } catch (error) {
      next(error);
    }
  }
}

export const categoryController = new CategoryController();
