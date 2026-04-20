import { prismaMock } from '../prisma.mock';
import { adminService } from '../../src/services/admin.service';
import { notificationService } from '../../src/services/notification.service';
import { ProviderStatus } from '@prisma/client';

// Mock notification service
jest.mock('../../src/services/notification.service', () => ({
  notificationService: {
    createNotification: jest.fn().mockResolvedValue({}),
  },
}));

describe('AdminService', () => {
  const providerData: any = {
    id: 'prov-1',
    userId: 'user-1',
    status: ProviderStatus.PENDING,
    bio: 'Test provider',
  };

  describe('getPendingProviders', () => {
    it('should return providers with PENDING status', async () => {
      prismaMock.providerProfile.findMany.mockResolvedValue([providerData]);

      const result = await adminService.getPendingProviders();

      expect(prismaMock.providerProfile.findMany).toHaveBeenCalledWith(expect.objectContaining({
        where: { status: ProviderStatus.PENDING }
      }));
      expect(result).toHaveLength(1);
    });
  });

  describe('approveProvider', () => {
    it('should throw error if provider not found', async () => {
      prismaMock.providerProfile.findUnique.mockResolvedValue(null);

      await expect(adminService.approveProvider('non-existent', 'admin-1'))
        .rejects.toThrow('Provider profile not found');
    });

    it('should throw error if already approved', async () => {
      prismaMock.providerProfile.findUnique.mockResolvedValue({ ...providerData, status: ProviderStatus.APPROVED });

      await expect(adminService.approveProvider('prov-1', 'admin-1'))
        .rejects.toThrow('Provider is already approved');
    });

    it('should approve provider and create notification', async () => {
      prismaMock.providerProfile.findUnique.mockResolvedValue(providerData);
      prismaMock.providerProfile.update.mockResolvedValue({ ...providerData, status: ProviderStatus.APPROVED });

      const result = await adminService.approveProvider('prov-1', 'admin-1');

      expect(prismaMock.providerProfile.update).toHaveBeenCalledWith(expect.objectContaining({
        data: expect.objectContaining({ status: ProviderStatus.APPROVED })
      }));
      expect(notificationService.createNotification).toHaveBeenCalled();
      expect(result.status).toBe(ProviderStatus.APPROVED);
    });
  });

  describe('rejectProvider', () => {
    it('should reject provider and create notification', async () => {
      prismaMock.providerProfile.findUnique.mockResolvedValue(providerData);
      prismaMock.providerProfile.update.mockResolvedValue({ ...providerData, status: ProviderStatus.REJECTED, rejectionReason: 'Bad photo' });

      const result = await adminService.rejectProvider('prov-1', 'admin-1', 'Bad photo');

      expect(prismaMock.providerProfile.update).toHaveBeenCalledWith(expect.objectContaining({
        data: expect.objectContaining({ 
          status: ProviderStatus.REJECTED,
          rejectionReason: 'Bad photo'
        })
      }));
      expect(notificationService.createNotification).toHaveBeenCalled();
      expect(result.status).toBe(ProviderStatus.REJECTED);
    });
  });

  describe('deactivateProvider', () => {
    it('should deactivate an approved provider', async () => {
      prismaMock.providerProfile.findUnique.mockResolvedValue({ ...providerData, status: ProviderStatus.APPROVED });
      prismaMock.providerProfile.update.mockResolvedValue({ ...providerData, status: ProviderStatus.DEACTIVATED });

      const result = await adminService.deactivateProvider('prov-1', 'admin-1');

      expect(result.status).toBe(ProviderStatus.DEACTIVATED);
    });
  });

  describe('setCommissionRate', () => {
    it('should throw error for invalid rate', async () => {
      await expect(adminService.setCommissionRate('prov-1', 'admin-1', 105))
        .rejects.toThrow('Commission rate must be between 0 and 100');
    });

    it('should update commission rate', async () => {
      prismaMock.providerProfile.findUnique.mockResolvedValue(providerData);
      prismaMock.providerProfile.update.mockResolvedValue({ id: 'prov-1', commissionRate: 15 } as any);

      const result = await adminService.setCommissionRate('prov-1', 'admin-1', 15);

      expect(prismaMock.providerProfile.update).toHaveBeenCalledWith(expect.objectContaining({
        data: { commissionRate: 15 }
      }));
      expect(result.commissionRate).toBe(15);
    });
  });
});
