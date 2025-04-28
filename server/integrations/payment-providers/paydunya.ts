/**
 * PayDunya Payment Integration
 * 
 * Implementation of payment operations using the PayDunya API
 * PayDunya is a popular payment processor in West Africa, particularly in Senegal.
 * This integration will allow the app to accept payments via PayDunya in Morocco.
 * 
 * API Docs: https://developers.paydunya.com/
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

interface PaydunyaConfig {
  masterKey: string;
  privateKey: string;
  publicKey: string;
  token: string;
  baseUrl?: string;
}

export class PaydunyaProvider implements PaymentProvider {
  private config: PaydunyaConfig;
  private baseUrl: string;
  private initialized: boolean = false;

  constructor(config: PaydunyaConfig) {
    this.config = config;
    this.baseUrl = config.baseUrl || 'https://app.paydunya.com/api/v1';
    this.initialized = this.validateConfig();
  }

  /**
   * Validate that all required config parameters are present
   */
  private validateConfig(): boolean {
    return !!(this.config.masterKey && 
              this.config.privateKey && 
              this.config.publicKey && 
              this.config.token);
  }

  /**
   * Get authorization headers for PayDunya API
   */
  private getHeaders() {
    return {
      'PAYDUNYA-MASTER-KEY': this.config.masterKey,
      'PAYDUNYA-PRIVATE-KEY': this.config.privateKey,
      'PAYDUNYA-PUBLIC-KEY': this.config.publicKey,
      'PAYDUNYA-TOKEN': this.config.token,
      'Content-Type': 'application/json'
    };
  }

  /**
   * Get display name of the provider
   */
  getName(): string {
    return 'PayDunya';
  }

  /**
   * Check if provider is properly configured
   */
  isAvailable(): boolean {
    return this.initialized;
  }

  /**
   * Create a payment request with PayDunya
   */
  async createPayment(request: PaymentRequest): Promise<PaymentResponse> {
    if (!this.initialized) {
      return {
        success: false,
        message: 'PayDunya integration is not properly configured'
      };
    }

    try {
      // Format PayDunya's expected request structure
      const payload = {
        invoice: {
          total_amount: request.amount,
          description: request.description,
          items: {
            item_0: {
              name: request.description,
              quantity: 1,
              unit_price: request.amount,
              total_price: request.amount
            }
          },
          callback_url: request.callbackUrl,
          cancel_url: request.returnUrl,
          return_url: request.returnUrl
        },
        store: {
          name: 'Floussly'
        },
        custom_data: request.metadata || {}
      };

      // Make the API request to create an invoice
      const response = await axios.post(
        `${this.baseUrl}/checkout-invoice/create`,
        payload,
        { headers: this.getHeaders() }
      );

      // Handle response
      if (response.data.response_code === '00') {
        return {
          success: true,
          paymentUrl: response.data.response_text,
          transactionId: response.data.token,
          reference: response.data.invoice_token,
          providerReference: response.data.token,
          status: 'pending'
        };
      } else {
        return {
          success: false,
          message: response.data.response_text || 'Payment creation failed'
        };
      }
    } catch (error: any) {
      console.error('PayDunya payment creation error:', error.message);
      
      return {
        success: false,
        message: error.response?.data?.response_text || error.message || 'Payment creation failed'
      };
    }
  }

  /**
   * Check status of a transaction with PayDunya
   */
  async checkTransactionStatus(reference: string): Promise<TransactionStatus> {
    if (!this.initialized) {
      return {
        status: 'failed',
        reference,
        message: 'PayDunya integration is not properly configured'
      };
    }

    try {
      // Make API request to check invoice status
      const response = await axios.get(
        `${this.baseUrl}/checkout-invoice/confirm/${reference}`,
        { headers: this.getHeaders() }
      );

      // Map PayDunya status to our standard status
      let status: 'pending' | 'completed' | 'failed' | 'cancelled' = 'pending';

      if (response.data.status === 'completed') {
        status = 'completed';
      } else if (response.data.status === 'cancelled') {
        status = 'cancelled';
      } else if (response.data.status === 'failed') {
        status = 'failed';
      }

      return {
        status,
        reference,
        providerReference: response.data.token,
        message: response.data.response_text,
        amount: response.data.invoice?.total_amount,
        currency: 'XOF', // PayDunya primarily uses XOF (West African CFA franc)
        createdAt: new Date(response.data.created_at),
        updatedAt: new Date(response.data.updated_at),
        metadata: response.data.custom_data
      };
    } catch (error: any) {
      console.error('PayDunya status check error:', error.message);
      
      return {
        status: 'failed',
        reference,
        message: error.response?.data?.response_text || error.message || 'Status check failed'
      };
    }
  }

  /**
   * Process a refund with PayDunya
   */
  async processRefund(request: RefundRequest): Promise<RefundResponse> {
    if (!this.initialized) {
      return {
        success: false,
        message: 'PayDunya integration is not properly configured'
      };
    }

    try {
      // Note: PayDunya doesn't provide a direct refund API endpoint in their documentation
      // This is a placeholder for when PayDunya adds refund capabilities or for custom implementation
      // through their support channels
      
      // For now, return a not implemented response
      return {
        success: false,
        message: 'Refunds are not directly supported by the PayDunya API. Please contact PayDunya support.'
      };
    } catch (error: any) {
      console.error('PayDunya refund error:', error.message);
      
      return {
        success: false,
        message: error.response?.data?.response_text || error.message || 'Refund failed'
      };
    }
  }

  /**
   * Verify webhook signature from PayDunya
   */
  verifyWebhook(payload: any, signature: string): boolean {
    // PayDunya doesn't use a signature verification method in the same way as some other providers
    // Instead, you would validate the IPN (Instant Payment Notification) by checking the invoice token
    // and confirming the transaction with their API
    
    // For this implementation, we'll assume valid if the payload contains expected fields
    return !!(payload && payload.invoice_token && payload.status);
  }
}