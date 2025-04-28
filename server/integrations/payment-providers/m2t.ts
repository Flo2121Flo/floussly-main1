/**
 * M2T Money Transfer Payment Integration
 * 
 * Implementation of payment operations using the M2T API
 * M2T is a Moroccan payment and money transfer service.
 * 
 * Note: This is a placeholder implementation as M2T may not provide a public API.
 * The actual implementation would need to be updated based on M2T's documentation.
 */

import axios from 'axios';
import { 
  PaymentProvider, 
  PaymentRequest, 
  PaymentResponse, 
  TransactionStatus, 
  RefundRequest, 
  RefundResponse 
} from './types';
import crypto from 'crypto';

interface M2TConfig {
  apiKey: string;
  secretKey: string;
  baseUrl?: string;
}

export class M2TProvider implements PaymentProvider {
  private config: M2TConfig;
  private baseUrl: string;
  private initialized: boolean = false;

  constructor(config: M2TConfig) {
    this.config = config;
    this.baseUrl = config.baseUrl || 'https://api.m2t.ma/v1'; // Example URL (placeholder)
    this.initialized = this.validateConfig();
  }

  /**
   * Validate that all required config parameters are present
   */
  private validateConfig(): boolean {
    return !!(this.config.apiKey && this.config.secretKey);
  }

  /**
   * Generate authorization headers for M2T API
   */
  private getHeaders(payload?: any) {
    const timestamp = Math.floor(Date.now() / 1000).toString();
    
    // Create a signature using HMAC-SHA256 (common practice for API security)
    // This is an example implementation and would need to be updated based on M2T's actual requirements
    let signature = '';
    if (payload) {
      const stringToSign = `${timestamp}${JSON.stringify(payload)}`;
      signature = crypto
        .createHmac('sha256', this.config.secretKey)
        .update(stringToSign)
        .digest('hex');
    }

    return {
      'Authorization': `Bearer ${this.config.apiKey}`,
      'X-M2T-Timestamp': timestamp,
      'X-M2T-Signature': signature,
      'Content-Type': 'application/json'
    };
  }

  /**
   * Get display name of the provider
   */
  getName(): string {
    return 'M2T Money Transfer';
  }

  /**
   * Check if provider is properly configured
   */
  isAvailable(): boolean {
    return this.initialized;
  }

  /**
   * Create a payment request with M2T
   */
  async createPayment(request: PaymentRequest): Promise<PaymentResponse> {
    if (!this.initialized) {
      return {
        success: false,
        message: 'M2T integration is not properly configured'
      };
    }

    try {
      // Format M2T's expected request structure (placeholder)
      // This would need to be updated based on M2T's actual API documentation
      const payload = {
        amount: request.amount,
        currency: request.currency || 'MAD',
        description: request.description,
        customer: {
          name: request.customerName,
          email: request.customerEmail,
          phone: request.customerPhone
        },
        callback_url: request.callbackUrl,
        return_url: request.returnUrl,
        reference: request.reference || `floussly-${Date.now()}`,
        metadata: request.metadata || {}
      };

      // Make API request to create payment
      const response = await axios.post(
        `${this.baseUrl}/payments`,
        payload,
        { headers: this.getHeaders(payload) }
      );

      // Handle response (placeholder based on common API patterns)
      if (response.data.status === 'success') {
        return {
          success: true,
          paymentUrl: response.data.payment_url,
          transactionId: response.data.transaction_id,
          reference: response.data.reference,
          providerReference: response.data.provider_reference,
          status: 'pending'
        };
      } else {
        return {
          success: false,
          message: response.data.message || 'Payment creation failed'
        };
      }
    } catch (error: any) {
      console.error('M2T payment creation error:', error.message);
      
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Payment creation failed'
      };
    }
  }

  /**
   * Check status of a transaction with M2T
   */
  async checkTransactionStatus(reference: string): Promise<TransactionStatus> {
    if (!this.initialized) {
      return {
        status: 'failed',
        reference,
        message: 'M2T integration is not properly configured'
      };
    }

    try {
      // Make API request to check transaction status
      const response = await axios.get(
        `${this.baseUrl}/payments/${reference}`,
        { headers: this.getHeaders() }
      );

      // Map M2T status to our standard status (placeholder based on common patterns)
      let status: 'pending' | 'completed' | 'failed' | 'cancelled' = 'pending';

      if (response.data.status === 'completed' || response.data.status === 'success') {
        status = 'completed';
      } else if (response.data.status === 'cancelled') {
        status = 'cancelled';
      } else if (response.data.status === 'failed') {
        status = 'failed';
      }

      return {
        status,
        reference,
        providerReference: response.data.provider_reference,
        message: response.data.message,
        amount: response.data.amount,
        currency: response.data.currency || 'MAD',
        createdAt: new Date(response.data.created_at),
        updatedAt: new Date(response.data.updated_at),
        metadata: response.data.metadata
      };
    } catch (error: any) {
      console.error('M2T status check error:', error.message);
      
      return {
        status: 'failed',
        reference,
        message: error.response?.data?.message || error.message || 'Status check failed'
      };
    }
  }

  /**
   * Process a refund with M2T
   */
  async processRefund(request: RefundRequest): Promise<RefundResponse> {
    if (!this.initialized) {
      return {
        success: false,
        message: 'M2T integration is not properly configured'
      };
    }

    try {
      // Format M2T's expected request structure for refunds (placeholder)
      const payload = {
        transaction_id: request.transactionId,
        amount: request.amount, // Optional, full refund if not specified
        reason: request.reason,
        metadata: request.metadata || {}
      };

      // Make API request to process refund
      const response = await axios.post(
        `${this.baseUrl}/refunds`,
        payload,
        { headers: this.getHeaders(payload) }
      );

      // Handle response (placeholder based on common API patterns)
      if (response.data.status === 'success') {
        return {
          success: true,
          refundId: response.data.refund_id,
          status: response.data.status,
          amount: response.data.amount,
          message: response.data.message || 'Refund processed successfully'
        };
      } else {
        return {
          success: false,
          message: response.data.message || 'Refund failed'
        };
      }
    } catch (error: any) {
      console.error('M2T refund error:', error.message);
      
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Refund failed'
      };
    }
  }

  /**
   * Verify webhook signature from M2T
   */
  verifyWebhook(payload: any, signature: string): boolean {
    // This is a placeholder implementation for webhook verification
    // The actual implementation would depend on M2T's webhook signature mechanism
    
    try {
      // Example signature verification (common pattern)
      const timestamp = payload.timestamp || '';
      const stringToVerify = `${timestamp}${JSON.stringify(payload.data || {})}`;
      const expectedSignature = crypto
        .createHmac('sha256', this.config.secretKey)
        .update(stringToVerify)
        .digest('hex');
      
      return expectedSignature === signature;
    } catch (error) {
      console.error('M2T webhook verification error:', error);
      return false;
    }
  }
}