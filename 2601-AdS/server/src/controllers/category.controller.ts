import { Request, Response } from 'express';
import { categoryService } from '../services/category.service';
import { AuthRequest } from '../middleware/auth';

export class CategoryController {
  /**
   * GET /api/categories
   * List active categories (public)
   */
  async listActive(_req: Request, res: Response) {
    const categories = await categoryService.listActive();
    res.json({ categories });
  }

  /**
   * GET /api/admin/categories
   * List all categories including inactive (admin)
   */
  async listAll(_req: AuthRequest, res: Response) {
    const categories = await categoryService.listAll();
    res.json({ categories });
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
    const { id } = req.params;
    const data = req.body;

    const category = await categoryService.update(id, data);
    res.json({ category });
  }
}

export const categoryController = new CategoryController();
