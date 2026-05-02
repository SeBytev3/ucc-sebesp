// ============================================
// ENUMS
// ============================================

export type UserRole = 'CUSTOMER' | 'PROVIDER' | 'ADMIN';

export type ProviderStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'DEACTIVATED';

export type RequestStatus = 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'COMPLETED' | 'CANCELLED';

export type NotificationType =
  | 'PROVIDER_APPROVED'
  | 'PROVIDER_REJECTED'
  | 'NEW_MESSAGE'
  | 'REQUEST_RECEIVED'
  | 'REQUEST_ACCEPTED'
  | 'REQUEST_DECLINED'
  | 'NEW_REVIEW';

// ============================================
// MODELS
// ============================================

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: UserRole;
  languagePref: string;
  createdAt: string;
  updatedAt: string;
  providerProfile?: ProviderProfile | null;
}

export interface ServiceCategory {
  id: string;
  nameEs: string;
  nameEn: string;
  descriptionEs?: string;
  descriptionEn?: string;
  isActive: boolean;
  createdAt: string;
}

export interface ProviderPortfolio {
  id: string;
  providerId: string;
  imageUrl: string;
  caption?: string;
  displayOrder: number;
  createdAt: string;
}

export interface ProviderProfile {
  id: string;
  userId: string;
  serviceCategoryId: string;
  bio?: string;
  locationCity?: string;
  locationRegion?: string;
  locationLat?: number;
  locationLng?: number;
  certifications: string[];
  availabilityNotes?: string;
  status: ProviderStatus;
  rejectionReason?: string;
  commissionRate: number;
  averageRating: number;
  totalReviews: number;
  createdAt: string;
  updatedAt: string;

  // Relations (optional depending on API response)
  user?: User;
  category?: ServiceCategory;
  portfolio?: ProviderPortfolio[];
}

export interface ServiceRequest {
  id: string;
  customerId: string;
  providerId: string;
  categoryId: string;
  description: string;
  status: RequestStatus;
  providerResponseNotes?: string;
  requestedAt: string;
  respondedAt?: string;
  completedAt?: string;

  // Relations
  customer?: User;
  provider?: ProviderProfile;
  category?: ServiceCategory;
}

export interface Review {
  id: string;
  requestId: string;
  customerId: string;
  providerId: string;
  rating: number;
  comment?: string;
  createdAt: string;

  // Relations
  customer?: User;
  provider?: ProviderProfile;
}

export interface Message {
  id: string;
  requestId?: string;
  senderId: string;
  receiverId: string;
  content: string;
  isRead: boolean;
  createdAt: string;

  // Relations
  sender?: User;
  receiver?: User;
}

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  messageEs: string;
  messageEn: string;
  isRead: boolean;
  linkUrl?: string;
  createdAt: string;
}

// ============================================
// API RESPONSES
// ============================================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface AuthResponse {
  user: User;
  token?: string; // If using Bearer instead of only Cookies
}
