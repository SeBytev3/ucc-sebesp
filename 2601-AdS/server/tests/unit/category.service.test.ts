import { prismaMock } from '../prisma.mock';
import { categoryService } from '../../src/services/category.service';

describe('CategoryService', () => {
  const categoryData = {
    id: 'cat-1',
    nameEs: 'Plomería',
    nameEn: 'Plumbing',
    descriptionEs: 'Servicios de plomería',
    descriptionEn: 'Plumbing services',
    isActive: true,
    createdAt: new Date(),
  };

  describe('listActive', () => {
    it('should return only active categories', async () => {
      prismaMock.serviceCategory.findMany.mockResolvedValue([categoryData]);

      const result = await categoryService.listActive();

      expect(prismaMock.serviceCategory.findMany).toHaveBeenCalledWith(expect.objectContaining({
        where: { isActive: true }
      }));
      expect(result).toHaveLength(1);
      expect(result[0].nameEs).toBe('Plomería');
    });
  });

  describe('getById', () => {
    it('should return a category by id', async () => {
      prismaMock.serviceCategory.findUnique.mockResolvedValue(categoryData);

      const result = await categoryService.getById('cat-1');

      expect(prismaMock.serviceCategory.findUnique).toHaveBeenCalledWith({
        where: { id: 'cat-1' },
        select: expect.any(Object)
      });
      expect(result?.id).toBe('cat-1');
    });

    it('should return null if category not found', async () => {
      prismaMock.serviceCategory.findUnique.mockResolvedValue(null);

      const result = await categoryService.getById('non-existent');

      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('should create a new category', async () => {
      const newInput = {
        nameEs: 'Carpintería',
        nameEn: 'Carpentry',
      };
      prismaMock.serviceCategory.create.mockResolvedValue({
        ...categoryData,
        ...newInput,
        id: 'cat-2'
      });

      const result = await categoryService.create(newInput);

      expect(prismaMock.serviceCategory.create).toHaveBeenCalledWith({
        data: newInput,
        select: expect.any(Object)
      });
      expect(result.id).toBe('cat-2');
      expect(result.nameEs).toBe('Carpintería');
    });
  });

  describe('update', () => {
    it('should update an existing category', async () => {
      const updateData = { nameEs: 'Plomería Pro' };
      prismaMock.serviceCategory.update.mockResolvedValue({
        ...categoryData,
        ...updateData
      });

      const result = await categoryService.update('cat-1', updateData);

      expect(prismaMock.serviceCategory.update).toHaveBeenCalledWith({
        where: { id: 'cat-1' },
        data: updateData,
        select: expect.any(Object)
      });
      expect(result.nameEs).toBe('Plomería Pro');
    });
  });

  describe('listAll', () => {
    it('should return all categories including inactive', async () => {
      prismaMock.serviceCategory.findMany.mockResolvedValue([
        categoryData,
        { ...categoryData, id: 'cat-inactive', isActive: false }
      ]);

      const result = await categoryService.listAll();

      expect(prismaMock.serviceCategory.findMany).toHaveBeenCalledWith(expect.objectContaining({
        orderBy: expect.any(Array)
      }));
      expect(result).toHaveLength(2);
    });
  });
});
