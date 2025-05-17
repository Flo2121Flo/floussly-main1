export enum Language {
  ARABIC = 'ar',
  FRENCH = 'fr',
  ENGLISH = 'en',
  TAMAZIGHT = 'tz',
}

export enum Currency {
  MAD = 'MAD',
  USD = 'USD',
  EUR = 'EUR',
}

export enum DeviceType {
  MOBILE = 'mobile',
  TABLET = 'tablet',
  DESKTOP = 'desktop',
}

export enum NotificationType {
  TRANSACTION = 'transaction',
  KYC = 'kyc',
  SECURITY = 'security',
  TREASURE = 'treasure',
  CHAT = 'chat',
  SYSTEM = 'system',
}

export interface Notification {
  notificationId: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, any>;
  isRead: boolean;
  createdAt: Date;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, any>;
  };
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

export interface TimeRange {
  startDate: Date;
  endDate: Date;
}

export interface GeoBounds {
  northEast: {
    latitude: number;
    longitude: number;
  };
  southWest: {
    latitude: number;
    longitude: number;
  };
}

export interface RateLimit {
  limit: number;
  remaining: number;
  reset: number;
}

export interface CacheConfig {
  ttl: number; // Time to live in seconds
  staleWhileRevalidate?: boolean;
  tags?: string[];
} 