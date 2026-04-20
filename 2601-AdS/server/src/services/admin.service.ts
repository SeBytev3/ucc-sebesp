import { prisma } from '../config/database';
import { ProviderStatus, NotificationType } from '@prisma/client';
import { notificationService } from './notification.service';

export class AdminService {
  /**
   * List all pending provider registrations
   */
  async getPendingProviders() {
    const profiles = await prisma.providerProfile.findMany({
      where: { status: ProviderStatus.PENDING },
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
          },
        },
        category: {
          select: {
            id: true,
            nameEs: true,
            nameEn: true,
          },
        },
        portfolio: {
          orderBy: { displayOrder: 'asc' },
        },
      },
    });

    return profiles;
  }

  /**
   * Approve a provider profile
   */
  async approveProvider(profileId: string, _adminId: string) {
    const profile = await prisma.providerProfile.findUnique({
      where: { id: profileId },
    });

    if (!profile) {
      throw new Error('Provider profile not found');
    }

    if (profile.status === ProviderStatus.APPROVED) {
      throw new Error('Provider is already approved');
    }

    const updated = await prisma.providerProfile.update({
      where: { id: profileId },
      data: { status: ProviderStatus.APPROVED, rejectionReason: null },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        category: {
          select: {
            nameEs: true,
            nameEn: true,
          },
        },
      },
    });

    // Create notification for provider
    await notificationService.createNotification({
      userId: profile.userId,
      type: NotificationType.PROVIDER_APPROVED,
      messageEs: '¡Tu perfil ha sido aprobado! Ya puedes recibir solicitudes de servicio.',
      messageEn: 'Your profile has been approved! You can now receive service requests.',
      linkUrl: `/providers/${profileId}`,
    }).catch(err => console.error('Failed to create notification:', err));

    return updated;
  }

  /**
   * Reject a provider profile with reason
   */
  async rejectProvider(profileId: string, _adminId: string, reason: string) {
    const profile = await prisma.providerProfile.findUnique({
      where: { id: profileId },
    });

    if (!profile) {
      throw new Error('Provider profile not found');
    }

    if (profile.status === ProviderStatus.REJECTED && profile.rejectionReason === reason) {
      throw new Error('Provider is already rejected with this reason');
    }

    const updated = await prisma.providerProfile.update({
      where: { id: profileId },
      data: { status: ProviderStatus.REJECTED, rejectionReason: reason },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        category: {
          select: {
            nameEs: true,
            nameEn: true,
          },
        },
      },
    });

    // Create notification for provider
    await notificationService.createNotification({
      userId: profile.userId,
      type: NotificationType.PROVIDER_REJECTED,
      messageEs: `Tu perfil ha sido rechazado. Motivo: ${reason}`,
      messageEn: `Your profile has been rejected. Reason: ${reason}`,
      linkUrl: `/providers/${profileId}/edit`,
    }).catch(err => console.error('Failed to create notification:', err));

    return updated;
  }

  /**
   * Soft-deactivate a provider (hide from search, block new requests)
   */
  async deactivateProvider(profileId: string, _adminId: string) {
    const profile = await prisma.providerProfile.findUnique({
      where: { id: profileId },
    });

    if (!profile) {
      throw new Error('Provider profile not found');
    }

    if (profile.status === ProviderStatus.DEACTIVATED) {
      throw new Error('Provider is already deactivated');
    }

    const updated = await prisma.providerProfile.update({
      where: { id: profileId },
      data: { status: ProviderStatus.DEACTIVATED },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        category: {
          select: {
            nameEs: true,
            nameEn: true,
          },
        },
      },
    });

    return updated;
  }

  /**
   * Set custom commission rate for a provider
   */
  async setCommissionRate(profileId: string, _adminId: string, commissionRate: number) {
    if (commissionRate < 0 || commissionRate > 100) {
      throw new Error('Commission rate must be between 0 and 100');
    }

    const profile = await prisma.providerProfile.findUnique({
      where: { id: profileId },
    });

    if (!profile) {
      throw new Error('Provider profile not found');
    }

    const updated = await prisma.providerProfile.update({
      where: { id: profileId },
      data: { commissionRate },
      select: {
        id: true,
        commissionRate: true,
      },
    });

    return updated;
  }
}

export const adminService = new AdminService();
