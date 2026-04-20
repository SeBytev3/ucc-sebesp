import { prisma } from '../config/database';

interface CreateCategoryInput {
  nameEs: string;
  nameEn: string;
  descriptionEs?: string;
  descriptionEn?: string;
}

export class CategoryService {
  /**
   * List all active service categories (public)
   */
  async listActive() {
    const categories = await prisma.serviceCategory.findMany({
      where: { isActive: true },
      orderBy: { nameEs: 'asc' },
      select: {
        id: true,
        nameEs: true,
        nameEn: true,
        descriptionEs: true,
        descriptionEn: true,
      },
    });

    return categories;
  }

  /**
   * Get category by ID
   */
  async getById(id: string) {
    const category = await prisma.serviceCategory.findUnique({
      where: { id },
      select: {
        id: true,
        nameEs: true,
        nameEn: true,
        descriptionEs: true,
        descriptionEn: true,
        isActive: true,
        createdAt: true,
      },
    });

    return category;
  }

  /**
   * Create a new category (admin only)
   */
  async create(input: CreateCategoryInput) {
    const category = await prisma.serviceCategory.create({
      data: input,
      select: {
        id: true,
        nameEs: true,
        nameEn: true,
        descriptionEs: true,
        descriptionEn: true,
        isActive: true,
        createdAt: true,
      },
    });

    return category;
  }

  /**
   * Update category (admin only)
   */
  async update(id: string, data: Partial<CreateCategoryInput>) {
    const category = await prisma.serviceCategory.update({
      where: { id },
      data,
      select: {
        id: true,
        nameEs: true,
        nameEn: true,
        descriptionEs: true,
        descriptionEn: true,
        isActive: true,
      },
    });

    return category;
  }

  /**
   * List all categories including inactive (admin only)
   */
  async listAll() {
    const categories = await prisma.serviceCategory.findMany({
      orderBy: [{ isActive: 'desc' }, { nameEs: 'asc' }],
      select: {
        id: true,
        nameEs: true,
        nameEn: true,
        descriptionEs: true,
        descriptionEn: true,
        isActive: true,
        createdAt: true,
      },
    });

    return categories;
  }
}

export const categoryService = new CategoryService();
