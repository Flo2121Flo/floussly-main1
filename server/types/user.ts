export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
  AGENT = 'agent',
  MERCHANT = 'merchant'
}

export enum KYCStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected'
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  balance: number;
  currency: string;
  role: UserRole;
  kyc_status: KYCStatus;
  created_at: string;
  metadata?: {
    bankAccounts?: {
      accountNumber: string;
      bankName: string;
      isDefault: boolean;
    }[];
    addresses?: {
      type: string;
      value: string;
    }[];
    documents?: {
      type: string;
      url: string;
      status: string;
    }[];
  };
} 