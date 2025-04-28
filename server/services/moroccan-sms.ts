import axios from 'axios';
import { config } from '../config';
import { logError, logInfo } from '../utils/logger';

export class MoroccanSMSService {
  private static instance: MoroccanSMSService;
  private apiKey: string;
  private baseUrl: string;

  private constructor() {
    this.apiKey = config.moroccanBank.apiKey;
    this.baseUrl = config.moroccanBank.baseUrl;
  }

  public static getInstance(): MoroccanSMSService {
    if (!MoroccanSMSService.instance) {
      MoroccanSMSService.instance = new MoroccanSMSService();
    }
    return MoroccanSMSService.instance;
  }

  // Send SMS through IAM
  async sendIAMSMS(smsData: {
    phoneNumber: string;
    message: string;
    senderId?: string;
  }) {
    try {
      const response = await axios.post(`${this.baseUrl}/sms/iam/send`, smsData, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });
      logInfo('IAM SMS sent', { phoneNumber: smsData.phoneNumber });
      return response.data;
    } catch (error) {
      logError(error as Error, 'Failed to send IAM SMS');
      throw error;
    }
  }

  // Send SMS through INWI
  async sendINWISMS(smsData: {
    phoneNumber: string;
    message: string;
    senderId?: string;
  }) {
    try {
      const response = await axios.post(`${this.baseUrl}/sms/inwi/send`, smsData, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });
      logInfo('INWI SMS sent', { phoneNumber: smsData.phoneNumber });
      return response.data;
    } catch (error) {
      logError(error as Error, 'Failed to send INWI SMS');
      throw error;
    }
  }

  // Send SMS through Orange
  async sendOrangeSMS(smsData: {
    phoneNumber: string;
    message: string;
    senderId?: string;
  }) {
    try {
      const response = await axios.post(`${this.baseUrl}/sms/orange/send`, smsData, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });
      logInfo('Orange SMS sent', { phoneNumber: smsData.phoneNumber });
      return response.data;
    } catch (error) {
      logError(error as Error, 'Failed to send Orange SMS');
      throw error;
    }
  }

  // Send OTP
  async sendOTP(otpData: {
    phoneNumber: string;
    operator: 'IAM' | 'INWI' | 'ORANGE';
    length?: number;
    expiryMinutes?: number;
  }) {
    try {
      const response = await axios.post(`${this.baseUrl}/sms/otp/send`, otpData, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });
      logInfo('OTP sent', { phoneNumber: otpData.phoneNumber });
      return response.data;
    } catch (error) {
      logError(error as Error, 'Failed to send OTP');
      throw error;
    }
  }

  // Verify OTP
  async verifyOTP(verificationData: {
    phoneNumber: string;
    code: string;
    operator: 'IAM' | 'INWI' | 'ORANGE';
  }) {
    try {
      const response = await axios.post(`${this.baseUrl}/sms/otp/verify`, verificationData, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });
      logInfo('OTP verified', { phoneNumber: verificationData.phoneNumber });
      return response.data;
    } catch (error) {
      logError(error as Error, 'Failed to verify OTP');
      throw error;
    }
  }

  // Get SMS delivery status
  async getSMSDeliveryStatus(messageId: string, operator: 'IAM' | 'INWI' | 'ORANGE') {
    try {
      const response = await axios.get(`${this.baseUrl}/sms/${operator}/status/${messageId}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      });
      return response.data;
    } catch (error) {
      logError(error as Error, 'Failed to get SMS delivery status');
      throw error;
    }
  }

  // Get SMS balance
  async getSMSBalance(operator: 'IAM' | 'INWI' | 'ORANGE') {
    try {
      const response = await axios.get(`${this.baseUrl}/sms/${operator}/balance`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      });
      return response.data;
    } catch (error) {
      logError(error as Error, 'Failed to get SMS balance');
      throw error;
    }
  }

  // Send bulk SMS
  async sendBulkSMS(bulkData: {
    phoneNumbers: string[];
    message: string;
    operator: 'IAM' | 'INWI' | 'ORANGE';
    senderId?: string;
  }) {
    try {
      const response = await axios.post(`${this.baseUrl}/sms/bulk/send`, bulkData, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });
      logInfo('Bulk SMS sent', { count: bulkData.phoneNumbers.length });
      return response.data;
    } catch (error) {
      logError(error as Error, 'Failed to send bulk SMS');
      throw error;
    }
  }
} 