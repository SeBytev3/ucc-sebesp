import { prismaMock } from '../prisma.mock';
import { providerService } from '../../src/services/provider.service';
import { ProviderStatus, Prisma } from '@prisma/client';

describe('ProviderService', () => {
  const providerData: any = {
    id: 'prov-1',
    userId: 'user-1',
    serviceCategoryId: 'cat-1',
    status: ProviderStatus.PENDING,
    bio: 'Experienced plumber',
    locationCity: 'Cordoba',
    locationRegion: 'Cordoba',
    locationLat: new Prisma.Decimal(0),
    locationLng: new Prisma.Decimal(0),
    certifications: ['Certified Plumber'],
    availabilityNotes: 'Mon-Fri',
    rejectionReason: null,
    commissionRate: new Prisma.Decimal(10),
    averageRating: new Prisma.Decimal(0),
    totalReviews: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  describe('register', () => {
    it('should throw error if user already has a profile', async () => {
      prismaMock.providerProfile.findUnique.mockResolvedValue(providerData);

      await expect(providerService.register('user-1', { serviceCategoryId: 'cat-1' }))
        .rejects.toThrow('User already has a provider profile');
    });

    it('should throw error for invalid or inactive category', async () => {
      prismaMock.providerProfile.findUnique.mockResolvedValue(null);
      prismaMock.serviceCategory.findUnique.mockResolvedValue(null);

      await expect(providerService.register('user-1', { serviceCategoryId: 'cat-invalid' }))
        .rejects.toThrow('Invalid service category');
    });

    it('should create profile if data is valid', async () => {
      prismaMock.providerProfile.findUnique.mockResolvedValue(null);
      prismaMock.serviceCategory.findUnique.mockResolvedValue({ id: 'cat-1', isActive: true } as any);
      prismaMock.providerProfile.create.mockResolvedValue(providerData);

      const result = await providerService.register('user-1', { serviceCategoryId: 'cat-1', bio: 'Experienced plumber' });

      expect(prismaMock.providerProfile.create).toHaveBeenCalled();
      expect(result.id).toBe('prov-1');
    });
  });

  describe('getById', () => {
    it('should return null if profile not found', async () => {
      prismaMock.providerProfile.findUnique.mockResolvedValue(null);

      const result = await providerService.getById('non-existent');

      expect(result).toBeNull();
    });

    it('should hide non-approved profile from public', async () => {
      prismaMock.providerProfile.findUnique.mockResolvedValue(providerData);

      const result = await providerService.getById('prov-1');

      expect(result).toBeNull();
    });

    it('should show non-approved profile to owner', async () => {
      prismaMock.providerProfile.findUnique.mockResolvedValue(providerData);

      const result = await providerService.getById('prov-1', 'user-1');

      expect(result).not.toBeNull();
      expect(result?.id).toBe('prov-1');
    });

    it('should show approved profile to anyone', async () => {
      prismaMock.providerProfile.findUnique.mockResolvedValue({ ...providerData, status: ProviderStatus.APPROVED });

      const result = await providerService.getById('prov-1');

      expect(result?.status).toBe(ProviderStatus.APPROVED);
    });
  });

  describe('update', () => {
    it('should throw error if profile not found', async () => {
      prismaMock.providerProfile.findUnique.mockResolvedValue(null);

      await expect(providerService.update('non-existent', 'user-1', {}))
        .rejects.toThrow('Provider profile not found');
    });

    it('should throw error if not the owner', async () => {
      prismaMock.providerProfile.findUnique.mockResolvedValue(providerData);

      await expect(providerService.update('prov-1', 'user-wrong', {}))
        .rejects.toThrow('Not authorized to update this profile');
    });

    it('should throw error if status is DEACTIVATED', async () => {
      prismaMock.providerProfile.findUnique.mockResolvedValue({ ...providerData, status: ProviderStatus.DEACTIVATED });

      await expect(providerService.update('prov-1', 'user-1', {}))
        .rejects.toThrow('Cannot update deactivated profile');
    });

    it('should update profile and return it', async () => {
      prismaMock.providerProfile.findUnique.mockResolvedValue(providerData);
      prismaMock.providerProfile.update.mockResolvedValue({ ...providerData, bio: 'Updated bio' });

      const result = await providerService.update('prov-1', 'user-1', { bio: 'Updated bio' });

      expect(prismaMock.providerProfile.update).toHaveBeenCalled();
      expect(result.bio).toBe('Updated bio');
    });
  });

  describe('resubmit', () => {
    it('should only allow resubmitting REJECTED profiles', async () => {
      prismaMock.providerProfile.findUnique.mockResolvedValue(providerData); // status: PENDING

      await expect(providerService.resubmit('prov-1', 'user-1'))
        .rejects.toThrow('Can only resubmit rejected profiles');
    });

    it('should change status to PENDING on success', async () => {
      prismaMock.providerProfile.findUnique.mockResolvedValue({ ...providerData, status: ProviderStatus.REJECTED });
      prismaMock.providerProfile.update.mockResolvedValue({ ...providerData, status: ProviderStatus.PENDING });

      const result = await providerService.resubmit('prov-1', 'user-1');

      expect(result.status).toBe(ProviderStatus.PENDING);
    });
  });

  describe('search', () => {
    it('should return a paginated list of approved providers', async () => {
      prismaMock.providerProfile.findMany.mockResolvedValue([{ ...providerData, status: ProviderStatus.APPROVED }]);
      prismaMock.providerProfile.count.mockResolvedValue(1);

      const result = await providerService.search({ city: 'Cordoba' });

      expect(prismaMock.providerProfile.findMany).toHaveBeenCalledWith(expect.objectContaining({
        where: expect.objectContaining({
          status: ProviderStatus.APPROVED,
          locationCity: expect.any(Object)
        })
      }));
      expect(result.providers).toHaveLength(1);
      expect(result.pagination.total).toBe(1);
    });
  });
});
