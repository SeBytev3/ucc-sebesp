import { Request, Response } from 'express';
import { categoryService } from '../services/category.service';
import { AuthRequest } from '../middleware/auth';
import { localizeArray } from '../utils/i18n-utils';

export class CategoryController {
  /**
   * GET /api/categories
   * List active categories (public)
   */
  async listActive(req: Request, res: Response) {
    const categories = await categoryService.listActive();
    const lng = (req as any).language || 'es';
    
    res.json({ 
      categories: localizeArray(categories, lng, ['name', 'description']) 
    });
  }

  /**
   * GET /api/admin/categories
   * List all categories including inactive (admin)
   */
  async listAll(req: AuthRequest, res: Response) {
    const categories = await categoryService.listAll();
    const lng = (req as any).language || 'es';

    res.json({ 
      categories: localizeArray(categories, lng, ['name', 'description']) 
    });
  }

  /**
   * POST /api/admin/categories
   * Create new category (admin)
   */
  async create(req: Request, res: Response) {
    const { nameEs, nameEn, descriptionEs, descriptionEn } = req.body;

    const category = await categoryService.create({
      nameEs,
      nameEn,
      descriptionEs,
      descriptionEn,
    });

    res.status(201).json({ category });
  }

  /**
   * PATCH /api/admin/categories/:id
   * Update category (admin)
   */
  async update(req: Request, res: Response) {
    const id = req.params.id as string;
    const data = req.body;

    const category = await categoryService.update(id, data);
    res.json({ category });
  }
}

export const categoryController = new CategoryController();
