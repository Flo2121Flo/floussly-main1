export interface Payment {
  id: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
  reference?: string;
  paymentUrl?: string;
  provider?: string;
  callbackUrl?: string;
  customerInfo?: {
    name?: string;
    email?: string;
    phone?: string;
  };
  metadata?: Record<string, any>;
}

export type PaymentStatus = 'pending' | 'completed' | 'failed';

export interface PaymentProvider {
  name: string;
  initializePayment(amount: number, currency: string): Promise<string>;
  verifyPayment(reference: string): Promise<PaymentVerificationResponse>;
}

export interface PaymentVerificationResponse {
  success: boolean;
  reference: string;
  status: PaymentStatus;
  amount: number;
  currency: string;
  message: string;
} 