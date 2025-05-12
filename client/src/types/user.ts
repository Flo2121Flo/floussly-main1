import { Language } from './common';

export interface UserProfile {
  userId: string;
  username: string;
  phone: string;
  email: string;
  registrationDate: Date;
  language: Language;
  deviceFingerprint: string;
  defaultCurrency: string;
  qrCodeUrl: string;
  kycStatus: KYCStatus;
  kycLevel: KYCLevel;
  riskScore: number;
  isActive: boolean;
  lastLoginAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserWallet {
  walletId: string;
  userId: string;
  balance: number;
  currency: string;
  status: WalletStatus;
  kycLevelRequired: KYCLevel;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserDevice {
  deviceId: string;
  userId: string;
  deviceName: string;
  deviceType: string;
  lastActiveAt: Date;
  isTrusted: boolean;
  createdAt: Date;
}

export interface KYCDocument {
  documentId: string;
  userId: string;
  documentType: DocumentType;
  fileName: string;
  fileUrl: string;
  status: DocumentStatus;
  rejectionReason?: string;
  uploadedAt: Date;
  verifiedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuditLog {
  logId: string;
  userId: string;
  actionType: AuditActionType;
  ipAddress: string;
  deviceId: string;
  details: Record<string, any>;
  timestamp: Date;
}

export enum KYCStatus {
  UNVERIFIED = 'unverified',
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

export enum KYCLevel {
  LEVEL_0 = 'level_0', // Basic info only
  LEVEL_1 = 'level_1', // ID verification
  LEVEL_2 = 'level_2', // Address verification
  LEVEL_3 = 'level_3', // Enhanced due diligence
}

export enum WalletStatus {
  ACTIVE = 'active',
  LOCKED = 'locked',
  SUSPENDED = 'suspended',
  CLOSED = 'closed',
}

export enum DocumentType {
  ID_CARD = 'id_card',
  PASSPORT = 'passport',
  DRIVERS_LICENSE = 'drivers_license',
  PROOF_OF_ADDRESS = 'proof_of_address',
  SELFIE = 'selfie',
}

export enum DocumentStatus {
  PENDING = 'pending',
  VERIFIED = 'verified',
  REJECTED = 'rejected',
  EXPIRED = 'expired',
}

export enum AuditActionType {
  LOGIN = 'login',
  LOGOUT = 'logout',
  REGISTER = 'register',
  WALLET_CREATE = 'wallet_create',
  WALLET_UPDATE = 'wallet_update',
  TRANSACTION_CREATE = 'transaction_create',
  TRANSACTION_UPDATE = 'transaction_update',
  KYC_UPLOAD = 'kyc_upload',
  KYC_VERIFY = 'kyc_verify',
  DEVICE_ADD = 'device_add',
  DEVICE_REMOVE = 'device_remove',
  PASSWORD_CHANGE = 'password_change',
  LANGUAGE_CHANGE = 'language_change',
} 