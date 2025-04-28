import axios from 'axios';
import { config } from '../config';
import { logError, logInfo } from '../utils/logger';

export class MoroccanKYCService {
  private static instance: MoroccanKYCService;
  private apiKey: string;
  private baseUrl: string;

  private constructor() {
    this.apiKey = config.moroccanBank.apiKey;
    this.baseUrl = config.moroccanBank.baseUrl;
  }

  public static getInstance(): MoroccanKYCService {
    if (!MoroccanKYCService.instance) {
      MoroccanKYCService.instance = new MoroccanKYCService();
    }
    return MoroccanKYCService.instance;
  }

  // Verify CIN (National ID)
  async verifyCIN(cinData: {
    cinNumber: string;
    firstName: string;
    lastName: string;
    dateOfBirth: string;
  }) {
    try {
      const response = await axios.post(`${this.baseUrl}/kyc/verify-cin`, cinData, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });
      logInfo('CIN verification completed', { cinNumber: cinData.cinNumber });
      return response.data;
    } catch (error) {
      logError(error as Error, 'CIN verification failed');
      throw error;
    }
  }

  // Verify passport
  async verifyPassport(passportData: {
    passportNumber: string;
    firstName: string;
    lastName: string;
    nationality: string;
    dateOfBirth: string;
  }) {
    try {
      const response = await axios.post(`${this.baseUrl}/kyc/verify-passport`, passportData, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });
      logInfo('Passport verification completed', { passportNumber: passportData.passportNumber });
      return response.data;
    } catch (error) {
      logError(error as Error, 'Passport verification failed');
      throw error;
    }
  }

  // Verify residence permit
  async verifyResidencePermit(permitData: {
    permitNumber: string;
    firstName: string;
    lastName: string;
    nationality: string;
    dateOfBirth: string;
    expiryDate: string;
  }) {
    try {
      const response = await axios.post(`${this.baseUrl}/kyc/verify-residence-permit`, permitData, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });
      logInfo('Residence permit verification completed', { permitNumber: permitData.permitNumber });
      return response.data;
    } catch (error) {
      logError(error as Error, 'Residence permit verification failed');
      throw error;
    }
  }

  // Verify address
  async verifyAddress(addressData: {
    address: string;
    city: string;
    postalCode: string;
    documentType: 'UTILITY_BILL' | 'RENTAL_CONTRACT' | 'TAX_NOTICE';
    documentNumber: string;
  }) {
    try {
      const response = await axios.post(`${this.baseUrl}/kyc/verify-address`, addressData, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });
      logInfo('Address verification completed', { address: addressData.address });
      return response.data;
    } catch (error) {
      logError(error as Error, 'Address verification failed');
      throw error;
    }
  }

  // Verify phone number
  async verifyPhoneNumber(phoneData: {
    phoneNumber: string;
    operator: 'IAM' | 'INWI' | 'ORANGE';
  }) {
    try {
      const response = await axios.post(`${this.baseUrl}/kyc/verify-phone`, phoneData, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });
      logInfo('Phone number verification completed', { phoneNumber: phoneData.phoneNumber });
      return response.data;
    } catch (error) {
      logError(error as Error, 'Phone number verification failed');
      throw error;
    }
  }

  // Verify email
  async verifyEmail(emailData: {
    email: string;
    verificationCode: string;
  }) {
    try {
      const response = await axios.post(`${this.baseUrl}/kyc/verify-email`, emailData, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });
      logInfo('Email verification completed', { email: emailData.email });
      return response.data;
    } catch (error) {
      logError(error as Error, 'Email verification failed');
      throw error;
    }
  }

  // Get KYC status
  async getKYCStatus(userId: string) {
    try {
      const response = await axios.get(`${this.baseUrl}/kyc/status/${userId}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      });
      return response.data;
    } catch (error) {
      logError(error as Error, 'Failed to get KYC status');
      throw error;
    }
  }

  // Upload KYC documents
  async uploadKYC documents(userId: string, documents: {
    type: 'CIN' | 'PASSPORT' | 'RESIDENCE_PERMIT' | 'UTILITY_BILL' | 'RENTAL_CONTRACT' | 'TAX_NOTICE';
    file: Buffer;
    fileName: string;
  }[]) {
    try {
      const formData = new FormData();
      documents.forEach((doc, index) => {
        formData.append(`documents[${index}].type`, doc.type);
        formData.append(`documents[${index}].file`, new Blob([doc.file]), doc.fileName);
      });

      const response = await axios.post(`${this.baseUrl}/kyc/documents/${userId}`, formData, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      logInfo('KYC documents uploaded', { userId, documentCount: documents.length });
      return response.data;
    } catch (error) {
      logError(error as Error, 'Failed to upload KYC documents');
      throw error;
    }
  }

  // Get KYC document status
  async getKYC documentStatus(userId: string, documentId: string) {
    try {
      const response = await axios.get(`${this.baseUrl}/kyc/documents/${userId}/${documentId}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      });
      return response.data;
    } catch (error) {
      logError(error as Error, 'Failed to get KYC document status');
      throw error;
    }
  }
} 