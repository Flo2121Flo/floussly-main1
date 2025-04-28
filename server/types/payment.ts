export interface Payment {
  id: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type PaymentStatus = 'pending' | 'completed' | 'failed';

export interface PaymentProvider {
  name: string;
  initializePayment(amount: number, currency: string): Promise<string>;
  verifyPayment(reference: string): Promise<boolean>;
} 