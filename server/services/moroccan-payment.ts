import axios from 'axios';
import { config } from '../config';
import { logError, logInfo } from '../utils/logger';

export class MoroccanPaymentService {
  private static instance: MoroccanPaymentService;
  private apiKey: string;
  private baseUrl: string;

  private constructor() {
    this.apiKey = config.moroccanBank.apiKey;
    this.baseUrl = config.moroccanBank.baseUrl;
  }

  public static getInstance(): MoroccanPaymentService {
    if (!MoroccanPaymentService.instance) {
      MoroccanPaymentService.instance = new MoroccanPaymentService();
    }
    return MoroccanPaymentService.instance;
  }

  // CMI Payment Integration
  async processCMIPayment(paymentData: {
    amount: number;
    currency: string;
    description: string;
    customerEmail: string;
    customerPhone: string;
    returnUrl: string;
    cancelUrl: string;
  }) {
    try {
      const response = await axios.post(`${this.baseUrl}/cmi/payment`, paymentData, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });
      logInfo('CMI payment initiated', { paymentId: response.data.paymentId });
      return response.data;
    } catch (error) {
      logError(error as Error, 'CMI payment failed');
      throw error;
    }
  }

  // PayZone Payment Integration
  async processPayZonePayment(paymentData: {
    amount: number;
    currency: string;
    description: string;
    customerEmail: string;
    customerPhone: string;
    returnUrl: string;
    cancelUrl: string;
  }) {
    try {
      const response = await axios.post(`${this.baseUrl}/payzone/payment`, paymentData, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });
      logInfo('PayZone payment initiated', { paymentId: response.data.paymentId });
      return response.data;
    } catch (error) {
      logError(error as Error, 'PayZone payment failed');
      throw error;
    }
  }

  // HPS Payment Integration
  async processHPSPayment(paymentData: {
    amount: number;
    currency: string;
    description: string;
    customerEmail: string;
    customerPhone: string;
    returnUrl: string;
    cancelUrl: string;
  }) {
    try {
      const response = await axios.post(`${this.baseUrl}/hps/payment`, paymentData, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });
      logInfo('HPS payment initiated', { paymentId: response.data.paymentId });
      return response.data;
    } catch (error) {
      logError(error as Error, 'HPS payment failed');
      throw error;
    }
  }

  // Cash Plus Payment Integration
  async processCashPlusPayment(paymentData: {
    amount: number;
    currency: string;
    description: string;
    customerEmail: string;
    customerPhone: string;
    returnUrl: string;
    cancelUrl: string;
  }) {
    try {
      const response = await axios.post(`${this.baseUrl}/cashplus/payment`, paymentData, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });
      logInfo('Cash Plus payment initiated', { paymentId: response.data.paymentId });
      return response.data;
    } catch (error) {
      logError(error as Error, 'Cash Plus payment failed');
      throw error;
    }
  }

  // Get payment status
  async getPaymentStatus(paymentId: string, provider: string) {
    try {
      const response = await axios.get(`${this.baseUrl}/${provider}/payments/${paymentId}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      });
      return response.data;
    } catch (error) {
      logError(error as Error, 'Failed to get payment status');
      throw error;
    }
  }

  // Refund payment
  async refundPayment(paymentId: string, provider: string, refundData: {
    amount: number;
    reason: string;
  }) {
    try {
      const response = await axios.post(`${this.baseUrl}/${provider}/payments/${paymentId}/refund`, refundData, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });
      logInfo('Payment refund initiated', { refundId: response.data.refundId });
      return response.data;
    } catch (error) {
      logError(error as Error, 'Failed to refund payment');
      throw error;
    }
  }

  // Get payment history
  async getPaymentHistory(params: {
    startDate: string;
    endDate: string;
    provider?: string;
    status?: string;
    page?: number;
    limit?: number;
  }) {
    try {
      const response = await axios.get(`${this.baseUrl}/payments`, {
        params,
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      });
      return response.data;
    } catch (error) {
      logError(error as Error, 'Failed to get payment history');
      throw error;
    }
  }

  // Get available payment methods
  async getAvailablePaymentMethods() {
    try {
      const response = await axios.get(`${this.baseUrl}/payment-methods`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      });
      return response.data;
    } catch (error) {
      logError(error as Error, 'Failed to get payment methods');
      throw error;
    }
  }

  // Process mobile payment (IAM, INWI, Orange)
  async processMobilePayment(paymentData: {
    amount: number;
    phoneNumber: string;
    operator: 'IAM' | 'INWI' | 'ORANGE';
    description: string;
  }) {
    try {
      const response = await axios.post(`${this.baseUrl}/mobile/payment`, paymentData, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });
      logInfo('Mobile payment initiated', { paymentId: response.data.paymentId });
      return response.data;
    } catch (error) {
      logError(error as Error, 'Mobile payment failed');
      throw error;
    }
  }
} 