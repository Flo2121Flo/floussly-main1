import { KYCLevel } from './user';

export interface Transaction {
  txId: string;
  senderWalletId: string;
  receiverWalletId: string;
  amount: number;
  currency: string;
  status: TransactionStatus;
  type: TransactionType;
  description?: string;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}

export interface TransactionLimit {
  limitId: string;
  userId: string;
  type: LimitType;
  amount: number;
  currency: string;
  period: LimitPeriod;
  kycLevel: KYCLevel;
  createdAt: Date;
  updatedAt: Date;
}

export interface TransactionQR {
  qrId: string;
  userId: string;
  walletId: string;
  displayName: string;
  amount?: number;
  currency: string;
  isActive: boolean;
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface AMLCheck {
  checkId: string;
  userId: string;
  type: AMLCheckType;
  riskScore: number;
  status: AMLCheckStatus;
  matches: AMLMatch[];
  createdAt: Date;
  updatedAt: Date;
}

export interface AMLMatch {
  matchId: string;
  checkId: string;
  source: string;
  matchType: string;
  confidence: number;
  details: Record<string, any>;
  createdAt: Date;
}

export enum TransactionStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

export enum TransactionType {
  P2P = 'p2p',
  MERCHANT = 'merchant',
  DEPOSIT = 'deposit',
  WITHDRAWAL = 'withdrawal',
  TREASURE_CLAIM = 'treasure_claim',
}

export enum LimitType {
  DAILY = 'daily',
  MONTHLY = 'monthly',
  SINGLE = 'single',
  VELOCITY = 'velocity',
}

export enum LimitPeriod {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  YEARLY = 'yearly',
}

export enum AMLCheckType {
  USER = 'user',
  TRANSACTION = 'transaction',
  WALLET = 'wallet',
}

export enum AMLCheckStatus {
  PENDING = 'pending',
  PASSED = 'passed',
  FLAGGED = 'flagged',
  BLOCKED = 'blocked',
} 