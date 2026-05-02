import { prisma } from '../config/database';
import { ProviderStatus } from '@prisma/client';

interface RegisterProviderInput {
  serviceCategoryId: string;
  bio?: string;
  locationCity?: string;
  locationRegion?: string;
  locationLat?: number;
  locationLng?: number;
  certifications?: string[];
  availabilityNotes?: string;
}

interface UpdateProviderInput {
  serviceCategoryId?: string;
  bio?: string;
  locationCity?: string;
  locationRegion?: string;
  locationLat?: number;
  locationLng?: number;
  certifications?: string[];
  availabilityNotes?: string;
}

interface GetProvidersFilters {
  categoryId?: string;
  city?: string;
  minRating?: number;
  sort?: 'rating' | 'recent';
  page?: number;
  limit?: number;
}

export class ProviderService {
  /**
   * Register a new provider profile (status: PENDING)
   */
  async register(userId: string, input: RegisterProviderInput) {
    // Check if user already has a provider profile
    const existingProfile = await prisma.providerProfile.findUnique({
      where: { userId },
    });

    if (existingProfile) {
      if (existingProfile.status === ProviderStatus.REJECTED) {
        // If rejected, we update the existing profile and set it back to PENDING
        return await prisma.providerProfile.update({
          where: { userId },
          data: {
            serviceCategoryId: input.serviceCategoryId,
            bio: input.bio,
            locationCity: input.locationCity,
            locationRegion: input.locationRegion,
            status: ProviderStatus.PENDING,
            rejectionReason: null,
          },
          include: {
            user: { select: { id: true, email: true, firstName: true, lastName: true } },
            category: { select: { id: true, nameEs: true } }
          }
        });
      }
      throw new Error('User already has a provider profile');
    }

    // Verify category exists and is active
    const category = await prisma.serviceCategory.findUnique({
      where: { id: input.serviceCategoryId },
    });

    if (!category || !category.isActive) {
      throw new Error('Invalid service category');
    }

    const profile = await prisma.providerProfile.create({
      data: {
        userId,
        serviceCategoryId: input.serviceCategoryId,
        bio: input.bio,
        locationCity: input.locationCity,
        locationRegion: input.locationRegion,
        locationLat: input.locationLat,
        locationLng: input.locationLng,
        certifications: input.certifications || [],
        availabilityNotes: input.availabilityNotes,
        status: ProviderStatus.PENDING,
      },
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
      },
    });

    return profile;
  }

  /**
   * Get provider profile by ID
   * Public: only APPROVED profiles visible
   * Owner/Admin: any status visible
   */
  async getById(id: string, currentUserId?: string, currentUserRole?: string) {
    const profile = await prisma.providerProfile.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
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

    if (!profile) {
      return null;
    }

    // Hide non-approved profiles from public view
    if (profile.status !== ProviderStatus.APPROVED) {
      const isOwner = currentUserId === profile.userId;
      const isAdmin = currentUserRole === 'ADMIN';

      if (!isOwner && !isAdmin) {
        return null;
      }
    }

    return profile;
  }

  /**
   * Update provider profile
   * Pending/Rejected: can edit and resubmit
   * Approved: can update without re-review
   * Deactivated: cannot update
   */
  async update(id: string, userId: string, data: UpdateProviderInput) {
    const profile = await prisma.providerProfile.findUnique({
      where: { id },
    });

    if (!profile) {
      throw new Error('Provider profile not found');
    }

    if (profile.userId !== userId) {
      throw new Error('Not authorized to update this profile');
    }

    if (profile.status === ProviderStatus.DEACTIVATED) {
      throw new Error('Cannot update deactivated profile');
    }

    // Verify category if changing
    if (data.serviceCategoryId) {
      const category = await prisma.serviceCategory.findUnique({
        where: { id: data.serviceCategoryId },
      });

      if (!category || !category.isActive) {
        throw new Error('Invalid service category');
      }
    }

    const updated = await prisma.providerProfile.update({
      where: { id },
      data: {
        ...(data.serviceCategoryId && { serviceCategoryId: data.serviceCategoryId }),
        ...(data.bio !== undefined && { bio: data.bio }),
        ...(data.locationCity !== undefined && { locationCity: data.locationCity }),
        ...(data.locationRegion !== undefined && { locationRegion: data.locationRegion }),
        ...(data.locationLat !== undefined && { locationLat: data.locationLat }),
        ...(data.locationLng !== undefined && { locationLng: data.locationLng }),
        ...(data.certifications !== undefined && { certifications: data.certifications }),
        ...(data.availabilityNotes !== undefined && { availabilityNotes: data.availabilityNotes }),
      },
      include: {
        user: {
          select: {
            id: true,
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
      },
    });

    return updated;
  }

  /**
   * Resubmit provider profile for review after rejection
   */
  async resubmit(id: string, userId: string) {
    const profile = await prisma.providerProfile.findUnique({
      where: { id },
    });

    if (!profile) {
      throw new Error('Provider profile not found');
    }

    if (profile.userId !== userId) {
      throw new Error('Not authorized to resubmit this profile');
    }

    if (profile.status !== ProviderStatus.REJECTED) {
      throw new Error('Can only resubmit rejected profiles');
    }

    const updated = await prisma.providerProfile.update({
      where: { id },
      data: {
        status: ProviderStatus.PENDING,
        rejectionReason: null,
      },
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
            id: true,
            nameEs: true,
            nameEn: true,
          },
        },
      },
    });

    return updated;
  }

  /**
   * Search/filter approved providers with pagination
   */
  async search(filters: GetProvidersFilters) {
    const { categoryId, city, minRating, sort = 'recent', page = 1, limit = 20 } = filters;

    const where = {
      status: ProviderStatus.APPROVED,
      ...(categoryId && { serviceCategoryId: categoryId }),
      ...(city && { locationCity: { contains: city, mode: 'insensitive' as const } }),
      ...(minRating && { averageRating: { gte: minRating } }),
    };

    const orderBy =
      sort === 'rating' ? { averageRating: 'desc' as const } : { createdAt: 'desc' as const };

    const skip = (page - 1) * limit;

    const [providers, total] = await Promise.all([
      prisma.providerProfile.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          user: {
            select: {
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
      }),
      prisma.providerProfile.count({ where }),
    ]);

    return {
      providers,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}

export const providerService = new ProviderService();
