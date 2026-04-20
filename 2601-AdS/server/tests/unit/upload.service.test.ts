import { prismaMock } from '../prisma.mock';
import { uploadService } from '../../src/services/upload.service';
import fs from 'fs/promises';

// Mock fs/promises
jest.mock('fs/promises', () => ({
  access: jest.fn(),
  mkdir: jest.fn(),
  writeFile: jest.fn().mockResolvedValue(undefined),
  unlink: jest.fn().mockResolvedValue(undefined),
}));

// Mock uuid
jest.mock('uuid', () => ({
  v4: () => 'fixed-uuid',
}));

describe('UploadService', () => {
  const providerData: any = {
    id: 'prov-1',
    portfolio: [],
  };

  const fileMock: any = {
    originalname: 'test.jpg',
    buffer: Buffer.from('fake-data'),
  };

  describe('uploadPortfolioImage', () => {
    it('should throw if provider not found', async () => {
      prismaMock.providerProfile.findUnique.mockResolvedValue(null);
      await expect(uploadService.uploadPortfolioImage('non-existent', fileMock))
        .rejects.toThrow('Provider profile not found');
    });

    it('should throw if portfolio limit reached', async () => {
      prismaMock.providerProfile.findUnique.mockResolvedValue({
        ...providerData,
        portfolio: Array(10).fill({}),
      });
      await expect(uploadService.uploadPortfolioImage('prov-1', fileMock))
        .rejects.toThrow('Portfolio limit reached');
    });

    it('should write file and create record', async () => {
      prismaMock.providerProfile.findUnique.mockResolvedValue(providerData);
      prismaMock.providerPortfolio.create.mockResolvedValue({ id: 'port-1' } as any);

      const result = await uploadService.uploadPortfolioImage('prov-1', fileMock, 'My work');

      expect(fs.writeFile).toHaveBeenCalled();
      expect(prismaMock.providerPortfolio.create).toHaveBeenCalledWith(expect.objectContaining({
        data: expect.objectContaining({
          providerId: 'prov-1',
          imageUrl: expect.stringContaining('fixed-uuid.jpg'),
          caption: 'My work'
        })
      }));
      expect(result.id).toBe('port-1');
    });
  });

  describe('deletePortfolioImage', () => {
    it('should throw if image not found', async () => {
      prismaMock.providerPortfolio.findFirst.mockResolvedValue(null);
      await expect(uploadService.deletePortfolioImage('img-1', 'prov-1'))
        .rejects.toThrow('Image not found');
    });

    it('should delete from DB and unlink file', async () => {
      prismaMock.providerPortfolio.findFirst.mockResolvedValue({
        id: 'img-1',
        providerId: 'prov-1',
        imageUrl: '/uploads/test.jpg'
      } as any);

      await uploadService.deletePortfolioImage('img-1', 'prov-1');

      expect(prismaMock.providerPortfolio.delete).toHaveBeenCalled();
      expect(fs.unlink).toHaveBeenCalled();
    });
  });
});
