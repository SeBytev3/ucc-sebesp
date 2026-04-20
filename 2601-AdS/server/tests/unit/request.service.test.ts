import { prismaMock } from '../prisma.mock';
import { requestService } from '../../src/services/request.service';
import { notificationService } from '../../src/services/notification.service';
import { RequestStatus, ProviderStatus } from '@prisma/client';

// Mock notification service
jest.mock('../../src/services/notification.service', () => ({
  notificationService: {
    createNotification: jest.fn().mockResolvedValue({}),
  },
}));

describe('RequestService', () => {
  const requestData: any = {
    id: 'req-1',
    customerId: 'user-cust',
    providerId: 'prov-1',
    categoryId: 'cat-1',
    description: 'Need fix',
    status: RequestStatus.PENDING,
    customer: { firstName: 'John' },
  };

  describe('create', () => {
    it('should throw error if provider not found or not approved', async () => {
      prismaMock.providerProfile.findUnique.mockResolvedValue(null);
      await expect(requestService.create('user-cust', { providerId: 'non-existent', categoryId: 'cat-1', description: '' }))
        .rejects.toThrow('Provider not found');
    });

    it('should create request and notify provider', async () => {
      prismaMock.providerProfile.findUnique.mockResolvedValue({ id: 'prov-1', status: ProviderStatus.APPROVED, userId: 'user-prov' } as any);
      prismaMock.serviceCategory.findUnique.mockResolvedValue({ id: 'cat-1' } as any);
      prismaMock.serviceRequest.create.mockResolvedValue(requestData);

      const result = await requestService.create('user-cust', { providerId: 'prov-1', categoryId: 'cat-1', description: 'Need fix' });

      expect(prismaMock.serviceRequest.create).toHaveBeenCalled();
      expect(notificationService.createNotification).toHaveBeenCalled();
      expect(result.id).toBe('req-1');
    });
  });

  describe('listByUser', () => {
    it('should filter by customerId for sent role', async () => {
      prismaMock.serviceRequest.findMany.mockResolvedValue([requestData]);
      await requestService.listByUser('user-cust', 'sent');
      expect(prismaMock.serviceRequest.findMany).toHaveBeenCalledWith(expect.objectContaining({
        where: expect.objectContaining({ customerId: 'user-cust' })
      }));
    });
  });

  describe('respond', () => {
    it('should update status and notify customer', async () => {
      const pendingReq = { ...requestData, provider: { userId: 'user-prov' } };
      prismaMock.serviceRequest.findUnique.mockResolvedValue(pendingReq);
      prismaMock.serviceRequest.update.mockResolvedValue({ ...pendingReq, status: RequestStatus.ACCEPTED, provider: { user: { firstName: 'Jane' } } } as any);

      const result = await requestService.respond('req-1', 'user-prov', 'accept');

      expect(result.status).toBe(RequestStatus.ACCEPTED);
      expect(notificationService.createNotification).toHaveBeenCalled();
    });

    it('should throw error if not authorized', async () => {
      prismaMock.serviceRequest.findUnique.mockResolvedValue({ ...requestData, provider: { userId: 'user-prov' } });
      await expect(requestService.respond('req-1', 'user-wrong', 'accept'))
        .rejects.toThrow('Not authorized');
    });
  });

  describe('complete', () => {
    it('should mark as COMPLETED if status is ACCEPTED', async () => {
      const acceptedReq = { ...requestData, status: RequestStatus.ACCEPTED, provider: { userId: 'user-prov' } };
      prismaMock.serviceRequest.findUnique.mockResolvedValue(acceptedReq);
      prismaMock.serviceRequest.update.mockResolvedValue({ ...acceptedReq, status: RequestStatus.COMPLETED });

      const result = await requestService.complete('req-1', 'user-cust');

      expect(result.status).toBe(RequestStatus.COMPLETED);
    });
  });

  describe('cancel', () => {
    it('should allow customer to cancel pending request', async () => {
      prismaMock.serviceRequest.findUnique.mockResolvedValue(requestData);
      prismaMock.serviceRequest.update.mockResolvedValue({ ...requestData, status: RequestStatus.CANCELLED });

      const result = await requestService.cancel('req-1', 'user-cust');

      expect(result.status).toBe(RequestStatus.CANCELLED);
    });
  });
});
