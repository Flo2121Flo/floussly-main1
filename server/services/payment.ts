import { createServer, Server } from "http";
import axios from "axios";
import { v4 as uuidv4 } from 'uuid';
import { DatabaseService } from '../database/db';
import { RedisService } from '../redis/redis';
import { Payment, PaymentProvider, PaymentStatus } from '../types/payment';
import { providers } from './payment-providers';
import { BankService } from './bank';
import { logger } from '../utils/logger';

// Payment Provider Interface
export interface PaymentProvider {
  name: string;
  createPayment(data: CreatePaymentRequest): Promise<PaymentResponse>;
  verifyPayment(reference: string): Promise<VerificationResponse>;
  initializePayment(amount: number, currency: string): Promise<string>;
}

// Payment Request & Response Types
export interface CreatePaymentRequest {
  amount: number;
  currency: string;
  description: string;
  callbackUrl: string;
  reference?: string;
  customerInfo?: {
    name?: string;
    email?: string;
    phone?: string;
  };
  metadata?: Record<string, any>;
}

export interface PaymentResponse {
  success: boolean;
  reference: string;
  paymentUrl?: string;
  message?: string;
  status: 'pending' | 'completed' | 'failed';
  providerId?: string;
  providerReference?: string;
}

export interface VerificationResponse {
  success: boolean;
  reference: string;
  status: 'pending' | 'completed' | 'failed';
  amount?: number;
  currency?: string;
  metadata?: Record<string, any>;
  message?: string;
}

// PayDunya Provider
export class PayDunyaProvider implements PaymentProvider {
  name = 'paydunya';
  private masterKey: string;
  private privateKey: string;
  private publicKey: string;
  private token: string;
  private baseUrl: string;

  constructor(config: {
    masterKey: string;
    privateKey: string;
    publicKey: string;
    token: string;
    sandbox?: boolean;
  }) {
    this.masterKey = config.masterKey;
    this.privateKey = config.privateKey;
    this.publicKey = config.publicKey;
    this.token = config.token;
    this.baseUrl = config.sandbox 
      ? "https://app.sandbox.paydunya.com/api/v1"
      : "https://app.paydunya.com/api/v1";
  }

  async createPayment(data: CreatePaymentRequest): Promise<PaymentResponse> {
    try {
      const response = await axios.post(`${this.baseUrl}/checkout-invoice/create`, {
        invoice: {
          total_amount: data.amount,
          description: data.description,
          callback_url: data.callbackUrl,
          custom_data: data.metadata
        },
        store: {
          name: "Floussly",
          logo_url: "https://floussly.com/logo.png"
        },
        actions: {
          cancel_url: `${data.callbackUrl}?status=cancelled`,
          return_url: `${data.callbackUrl}?status=success`
        }
      }, {
        headers: {
          'PAYDUNYA-MASTER-KEY': this.masterKey,
          'PAYDUNYA-PRIVATE-KEY': this.privateKey,
          'PAYDUNYA-PUBLIC-KEY': this.publicKey,
          'PAYDUNYA-TOKEN': this.token,
          'Content-Type': 'application/json'
        }
      });

      if (response.data.response_code === "00") {
        return {
          success: true,
          reference: data.reference || response.data.invoice_token,
          paymentUrl: response.data.response_text,
          status: 'pending',
          providerId: 'paydunya',
          providerReference: response.data.invoice_token
        };
      } else {
        return {
          success: false,
          reference: data.reference || '',
          message: response.data.response_text,
          status: 'failed',
          providerId: 'paydunya'
        };
      }
    } catch (error: any) {
      return {
        success: false,
        reference: data.reference || '',
        message: error.message || 'Payment creation failed',
        status: 'failed',
        providerId: 'paydunya'
      };
    }
  }

  async verifyPayment(reference: string): Promise<VerificationResponse> {
    try {
      const response = await axios.get(`${this.baseUrl}/checkout-invoice/confirm/${reference}`, {
        headers: {
          'PAYDUNYA-MASTER-KEY': this.masterKey,
          'PAYDUNYA-PRIVATE-KEY': this.privateKey,
          'PAYDUNYA-PUBLIC-KEY': this.publicKey,
          'PAYDUNYA-TOKEN': this.token
        }
      });

      if (response.data.status === "completed") {
        return {
          success: true,
          reference,
          status: 'completed',
          amount: response.data.invoice.total_amount,
          currency: 'XOF',
          metadata: response.data.custom_data
        };
      } else {
        return {
          success: false,
          reference,
          status: response.data.status === "pending" ? 'pending' : 'failed',
          message: 'Payment not completed'
        };
      }
    } catch (error: any) {
      return {
        success: false,
        reference,
        status: 'failed',
        message: error.message || 'Verification failed'
      };
    }
  }

  async initializePayment(amount: number, currency: string): Promise<string> {
    // Implementation needed
    throw new Error("Method not implemented");
  }
}

// CMI Provider
export class CMIProvider implements PaymentProvider {
  name = 'cmi';
  private storeId: string;
  private clientId: string;
  private storeName: string;
  private secretKey: string;
  private baseUrl: string;

  constructor(config: {
    storeId: string;
    clientId: string;
    storeName: string;
    secretKey: string;
    sandbox?: boolean;
  }) {
    this.storeId = config.storeId;
    this.clientId = config.clientId;
    this.storeName = config.storeName;
    this.secretKey = config.secretKey;
    this.baseUrl = config.sandbox 
      ? "https://testpayment.cmi.co.ma"
      : "https://payment.cmi.co.ma";
  }

  async createPayment(data: CreatePaymentRequest): Promise<PaymentResponse> {
    // Implementation based on CMI documentation would go here
    // This is placeholder code as actual CMI integration requires specific documentation
    try {
      // CMI requires a server-to-server request with a digital signature
      const paymentReference = `FL${Date.now()}`;
      
      return {
        success: true,
        reference: data.reference || paymentReference,
        paymentUrl: `${this.baseUrl}/payment?oid=${paymentReference}&amount=${data.amount}&callbackUrl=${encodeURIComponent(data.callbackUrl)}`,
        status: 'pending',
        providerId: 'cmi',
        providerReference: paymentReference
      };
    } catch (error: any) {
      return {
        success: false,
        reference: data.reference || '',
        message: error.message || 'CMI payment creation failed',
        status: 'failed',
        providerId: 'cmi'
      };
    }
  }

  async verifyPayment(reference: string): Promise<VerificationResponse> {
    // Implementation based on CMI documentation would go here
    // This is placeholder code as actual CMI integration requires specific documentation
    try {
      return {
        success: true,
        reference,
        status: 'completed',
        amount: 0, // Would be retrieved from CMI response
        currency: 'MAD',
        metadata: {}
      };
    } catch (error: any) {
      return {
        success: false,
        reference,
        status: 'failed',
        message: error.message || 'CMI verification failed'
      };
    }
  }

  async initializePayment(amount: number, currency: string): Promise<string> {
    // Implementation needed
    throw new Error("Method not implemented");
  }
}

// M2T Provider
export class M2TProvider implements PaymentProvider {
  name = 'm2t';
  private apiKey: string;
  private merchantId: string;
  private baseUrl: string;

  constructor(config: {
    apiKey: string;
    merchantId: string;
    sandbox?: boolean;
  }) {
    this.apiKey = config.apiKey;
    this.merchantId = config.merchantId;
    this.baseUrl = config.sandbox 
      ? "https://sandbox.m2t.ma/api"
      : "https://api.m2t.ma/api";
  }

  async createPayment(data: CreatePaymentRequest): Promise<PaymentResponse> {
    try {
      // Implementation would be based on M2T API documentation
      const paymentReference = `FL${Date.now()}`;
      
      return {
        success: true,
        reference: data.reference || paymentReference,
        paymentUrl: `${this.baseUrl}/redirect?ref=${paymentReference}`,
        status: 'pending',
        providerId: 'm2t',
        providerReference: paymentReference
      };
    } catch (error: any) {
      return {
        success: false,
        reference: data.reference || '',
        message: error.message || 'M2T payment creation failed',
        status: 'failed',
        providerId: 'm2t'
      };
    }
  }

  async verifyPayment(reference: string): Promise<VerificationResponse> {
    try {
      // Implementation would be based on M2T API documentation
      return {
        success: true,
        reference,
        status: 'completed',
        amount: 0, // Would be filled from actual response
        currency: 'MAD',
        metadata: {}
      };
    } catch (error: any) {
      return {
        success: false,
        reference,
        status: 'failed',
        message: error.message || 'M2T verification failed'
      };
    }
  }

  async initializePayment(amount: number, currency: string): Promise<string> {
    // Implementation needed
    throw new Error("Method not implemented");
  }
}

// PayPal Provider
export class PayPalProvider implements PaymentProvider {
  name = 'paypal';
  private clientId: string;
  private clientSecret: string;
  private baseUrl: string;
  private accessToken: string | null = null;
  private tokenExpiry: number = 0;

  constructor(config: {
    clientId: string;
    clientSecret: string;
    sandbox?: boolean;
  }) {
    this.clientId = config.clientId;
    this.clientSecret = config.clientSecret;
    this.baseUrl = config.sandbox 
      ? "https://api-m.sandbox.paypal.com"
      : "https://api-m.paypal.com";
  }

  private async getAccessToken(): Promise<string> {
    if (this.accessToken && Date.now() < this.tokenExpiry) {
      return this.accessToken;
    }

    try {
      const auth = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64');
      const response = await axios.post(`${this.baseUrl}/v1/oauth2/token`, 'grant_type=client_credentials', {
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });

      this.accessToken = response.data.access_token;
      this.tokenExpiry = Date.now() + (response.data.expires_in * 1000);
      return this.accessToken;
    } catch (error: any) {
      throw new Error(`Failed to get PayPal access token: ${error.message}`);
    }
  }

  async createPayment(data: CreatePaymentRequest): Promise<PaymentResponse> {
    try {
      const token = await this.getAccessToken();
      
      const response = await axios.post(`${this.baseUrl}/v2/checkout/orders`, {
        intent: "CAPTURE",
        purchase_units: [{
          amount: {
            currency_code: data.currency || "USD",
            value: data.amount.toString()
          },
          description: data.description
        }],
        application_context: {
          return_url: data.callbackUrl,
          cancel_url: `${data.callbackUrl}?cancelled=true`
        }
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data.id) {
        // Find the approve link
        const approveLink = response.data.links.find((link: any) => link.rel === "approve");
        
        return {
          success: true,
          reference: data.reference || response.data.id,
          paymentUrl: approveLink ? approveLink.href : '',
          status: 'pending',
          providerId: 'paypal',
          providerReference: response.data.id
        };
      } else {
        return {
          success: false,
          reference: data.reference || '',
          message: 'Failed to create PayPal payment',
          status: 'failed',
          providerId: 'paypal'
        };
      }
    } catch (error: any) {
      return {
        success: false,
        reference: data.reference || '',
        message: error.message || 'PayPal payment creation failed',
        status: 'failed',
        providerId: 'paypal'
      };
    }
  }

  async verifyPayment(reference: string): Promise<VerificationResponse> {
    try {
      const token = await this.getAccessToken();
      
      const response = await axios.get(`${this.baseUrl}/v2/checkout/orders/${reference}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data.status === "COMPLETED") {
        const amount = response.data.purchase_units[0].amount.value;
        const currency = response.data.purchase_units[0].amount.currency_code;
        
        return {
          success: true,
          reference,
          status: 'completed',
          amount: parseFloat(amount),
          currency,
          metadata: {}
        };
      } else if (response.data.status === "CREATED" || response.data.status === "SAVED" || response.data.status === "APPROVED") {
        return {
          success: false,
          reference,
          status: 'pending',
          message: 'Payment not yet completed'
        };
      } else {
        return {
          success: false,
          reference,
          status: 'failed',
          message: `Payment failed with status: ${response.data.status}`
        };
      }
    } catch (error: any) {
      return {
        success: false,
        reference,
        status: 'failed',
        message: error.message || 'PayPal verification failed'
      };
    }
  }

  async initializePayment(amount: number, currency: string): Promise<string> {
    // Implementation needed
    throw new Error("Method not implemented");
  }
}

// Payment Service
export class PaymentService {
  private static instance: PaymentService;
  private db: DatabaseService;
  private redis: RedisService;
  private bankService: BankService;
  private providers = new Map<string, InstanceType<typeof providers.PayDunya>>();

  private constructor() {
    this.db = DatabaseService.getInstance();
    this.redis = RedisService.getInstance();
    this.bankService = new BankService();
  }

  public static getInstance(): PaymentService {
    if (!PaymentService.instance) {
      PaymentService.instance = new PaymentService();
    }
    return PaymentService.instance;
  }

  registerProvider(name: string, apiKey: string, apiSecret: string, baseUrl: string) {
    const provider = new providers.PayDunya(apiKey, apiSecret, baseUrl);
    this.providers.set(name, provider);
  }

  async initializePayment(provider: string, amount: number, currency: string): Promise<string> {
    const paymentProvider = this.providers.get(provider);
    if (!paymentProvider) {
      throw new Error(`Payment provider ${provider} not found`);
    }
    return paymentProvider.initializePayment(amount, currency);
  }

  async verifyPayment(provider: string, reference: string): Promise<boolean> {
    const paymentProvider = this.providers.get(provider);
    if (!paymentProvider) {
      throw new Error(`Payment provider ${provider} not found`);
    }
    return paymentProvider.verifyPayment(reference);
  }

  async createPayment(data: Omit<Payment, 'id' | 'status' | 'createdAt' | 'updatedAt'>): Promise<Payment> {
    const id = uuidv4();
    const now = new Date();
    
    const payment: Payment = {
      id,
      ...data,
      status: 'pending',
      createdAt: now,
      updatedAt: now,
    };

    // Store in Redis for quick access
    await this.redis.hset(`payment:${id}`, payment);
    
    // Store in database
    const query = `
      INSERT INTO payments (id, amount, currency, status, description, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;
    
    const values = [
      payment.id,
      payment.amount,
      payment.currency,
      payment.status,
      payment.description,
      payment.createdAt,
      payment.updatedAt,
    ];

    const result = await this.db.query(query, values);
    return result.rows[0];
  }

  async getPayment(id: string): Promise<Payment | null> {
    // Try to get from Redis first
    const cached = await this.redis.hgetall(`payment:${id}`);
    if (cached && Object.keys(cached).length > 0) {
      return cached as Payment;
    }

    // If not in Redis, get from database
    const query = 'SELECT * FROM payments WHERE id = $1';
    const result = await this.db.query(query, [id]);
    
    if (result.rows.length === 0) {
      return null;
    }

    const payment = result.rows[0];
    
    // Cache in Redis for future requests
    await this.redis.hset(`payment:${id}`, payment);
    
    return payment;
  }

  async getAllPayments(): Promise<Payment[]> {
    const query = 'SELECT * FROM payments ORDER BY created_at DESC';
    const result = await this.db.query(query);
    return result.rows;
  }

  async updatePayment(id: string, status: PaymentStatus): Promise<Payment | null> {
    const now = new Date();
    
    // Update in database
    const query = `
      UPDATE payments
      SET status = $1, updated_at = $2
      WHERE id = $3
      RETURNING *
    `;
    
    const result = await this.db.query(query, [status, now, id]);
    
    if (result.rows.length === 0) {
      return null;
    }

    const payment = result.rows[0];
    
    // Update Redis cache
    await this.redis.hset(`payment:${id}`, payment);
    
    return payment;
  }

  async deletePayment(id: string): Promise<boolean> {
    // Delete from database
    const query = 'DELETE FROM payments WHERE id = $1';
    const result = await this.db.query(query, [id]);
    
    // Delete from Redis
    await this.redis.del(`payment:${id}`);
    
    return result.rowCount > 0;
  }

  // Process a payment
  async processPayment(userId: string, data: {
    amount: number;
    currency: string;
    description: string;
    sourceAccountId: string;
    destinationAccountId: string;
    metadata?: Record<string, any>;
  }) {
    try {
      // Verify source account belongs to user
      const sourceAccount = await this.bankService.getAccountById(userId, data.sourceAccountId);
      if (!sourceAccount) {
        throw new Error('Source account not found');
      }

      // Check if source account has sufficient balance
      const balance = await this.bankService.getAccountBalance(userId, data.sourceAccountId);
      if (balance.availableBalance < data.amount) {
        throw new Error('Insufficient funds');
      }

      // Create payment record
      const payment = await this.db.query(
        'INSERT INTO payments (user_id, amount, currency, description, source_account_id, destination_account_id, metadata) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
        [userId, data.amount, data.currency, data.description, data.sourceAccountId, data.destinationAccountId, data.metadata]
      );

      // In a real application, this would call the payment processor's API
      // For now, we'll simulate a successful payment
      await this.updatePaymentStatus(payment.id, 'completed');

      return payment;
    } catch (error) {
      logger.error('Failed to process payment:', error);
      throw error;
    }
  }

  // Get payment status
  async getPaymentStatus(userId: string, paymentId: string) {
    try {
      const payment = await this.db.query(
        'SELECT status FROM payments WHERE id = $1 AND user_id = $2',
        [paymentId, userId]
      );

      if (!payment) {
        throw new Error('Payment not found');
      }

      return payment.status;
    } catch (error) {
      logger.error('Failed to get payment status:', error);
      throw error;
    }
  }

  // Get payment history
  async getPaymentHistory(userId: string, filters: {
    page: number;
    limit: number;
    status?: string;
    startDate?: string;
    endDate?: string;
  }) {
    try {
      const offset = (filters.page - 1) * filters.limit;
      const conditions = ['user_id = $1'];
      const values = [userId];
      let paramIndex = 2;

      if (filters.status) {
        conditions.push(`status = $${paramIndex}`);
        values.push(filters.status);
        paramIndex++;
      }

      if (filters.startDate) {
        conditions.push(`created_at >= $${paramIndex}`);
        values.push(filters.startDate);
        paramIndex++;
      }

      if (filters.endDate) {
        conditions.push(`created_at <= $${paramIndex}`);
        values.push(filters.endDate);
        paramIndex++;
      }

      const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
      const query = `
        SELECT * FROM payments
        ${whereClause}
        ORDER BY created_at DESC
        LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
      `;

      const payments = await this.db.query(query, [...values, filters.limit, offset]);
      const total = await this.db.query(
        `SELECT COUNT(*) FROM payments ${whereClause}`,
        values
      );

      return {
        payments,
        pagination: {
          total: parseInt(total.count),
          page: filters.page,
          limit: filters.limit,
          pages: Math.ceil(parseInt(total.count) / filters.limit),
        },
      };
    } catch (error) {
      logger.error('Failed to get payment history:', error);
      throw error;
    }
  }

  // Refund a payment
  async refundPayment(userId: string, paymentId: string, data: {
    amount: number;
    reason: string;
  }) {
    try {
      const payment = await this.db.query(
        'SELECT * FROM payments WHERE id = $1 AND user_id = $2',
        [paymentId, userId]
      );

      if (!payment) {
        throw new Error('Payment not found');
      }

      if (payment.status !== 'completed') {
        throw new Error('Only completed payments can be refunded');
      }

      if (data.amount > payment.amount) {
        throw new Error('Refund amount cannot exceed original payment amount');
      }

      // Create refund record
      const refund = await this.db.query(
        'INSERT INTO refunds (payment_id, amount, reason) VALUES ($1, $2, $3) RETURNING *',
        [paymentId, data.amount, data.reason]
      );

      // In a real application, this would call the payment processor's API
      // For now, we'll simulate a successful refund
      await this.updateRefundStatus(refund.id, 'completed');

      return refund;
    } catch (error) {
      logger.error('Failed to refund payment:', error);
      throw error;
    }
  }

  // Get payment details
  async getPaymentDetails(userId: string, paymentId: string) {
    try {
      const payment = await this.db.query(
        'SELECT * FROM payments WHERE id = $1 AND user_id = $2',
        [paymentId, userId]
      );

      if (!payment) {
        throw new Error('Payment not found');
      }

      return payment;
    } catch (error) {
      logger.error('Failed to get payment details:', error);
      throw error;
    }
  }

  // Helper method to update payment status
  private async updatePaymentStatus(paymentId: string, status: string) {
    await this.db.query(
      'UPDATE payments SET status = $1 WHERE id = $2',
      [status, paymentId]
    );
  }

  // Helper method to update refund status
  private async updateRefundStatus(refundId: string, status: string) {
    await this.db.query(
      'UPDATE refunds SET status = $1 WHERE id = $2',
      [status, refundId]
    );
  }
}

// Create and export payment service instance
export const paymentService = PaymentService.getInstance();