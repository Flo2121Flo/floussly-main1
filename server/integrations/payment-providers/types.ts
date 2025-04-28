/**
 * Common interfaces for payment provider integrations
 */

/**
 * Payment Request details for a transaction
 */
export interface PaymentRequest {
  amount: number;
  currency: string;
  description: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  reference?: string;
  callbackUrl?: string;
  returnUrl?: string;
  metadata?: Record<string, any>;
}

/**
 * Payment response from provider
 */
export interface PaymentResponse {
  success: boolean;
  paymentUrl?: string;
  reference?: string;
  transactionId?: string;
  message?: string;
  status?: string;
  providerReference?: string;
  receiptUrl?: string;
  metadata?: Record<string, any>;
}

/**
 * Transaction status from provider
 */
export interface TransactionStatus {
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  reference: string;
  providerReference?: string;
  message?: string;
  amount?: number;
  currency?: string;
  createdAt?: Date;
  updatedAt?: Date;
  metadata?: Record<string, any>;
}

/**
 * Refund request details
 */
export interface RefundRequest {
  transactionId: string;
  amount?: number;
  reason?: string;
  metadata?: Record<string, any>;
}

/**
 * Refund response from provider
 */
export interface RefundResponse {
  success: boolean;
  refundId?: string;
  message?: string;
  status?: string;
  amount?: number;
  metadata?: Record<string, any>;
}

/**
 * Base interface for all payment providers
 */
export interface PaymentProvider {
  /**
   * Get the display name of the payment provider
   */
  getName(): string;
  
  /**
   * Initialize a payment and get payment URL or token
   */
  createPayment(request: PaymentRequest): Promise<PaymentResponse>;
  
  /**
   * Check the status of a transaction 
   */
  checkTransactionStatus(reference: string): Promise<TransactionStatus>;
  
  /**
   * Process a refund for a transaction
   */
  processRefund(request: RefundRequest): Promise<RefundResponse>;
  
  /**
   * Verify webhook signature from provider
   */
  verifyWebhook(payload: any, signature: string): boolean;
  
  /**
   * Check if provider is available/configured
   */
  isAvailable(): boolean;
}