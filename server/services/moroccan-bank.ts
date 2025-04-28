import axios from 'axios';
import { config } from '../config';
import { logError, logInfo } from '../utils/logger';

export class MoroccanBankService {
  private static instance: MoroccanBankService;
  private apiKey: string;
  private baseUrl: string;

  private constructor() {
    this.apiKey = config.moroccanBank.apiKey;
    this.baseUrl = config.moroccanBank.baseUrl;
  }

  public static getInstance(): MoroccanBankService {
    if (!MoroccanBankService.instance) {
      MoroccanBankService.instance = new MoroccanBankService();
    }
    return MoroccanBankService.instance;
  }

  // Attijariwafa Bank Integration
  async attijariwafaBankTransfer(transferData: {
    fromAccount: string;
    toAccount: string;
    amount: number;
    description: string;
  }) {
    try {
      const response = await axios.post(`${this.baseUrl}/attijariwafa/transfer`, transferData, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });
      logInfo('Attijariwafa transfer successful', { transferId: response.data.transferId });
      return response.data;
    } catch (error) {
      logError(error as Error, 'Attijariwafa transfer failed');
      throw error;
    }
  }

  // BMCE Bank Integration
  async bmceBankTransfer(transferData: {
    fromAccount: string;
    toAccount: string;
    amount: number;
    description: string;
  }) {
    try {
      const response = await axios.post(`${this.baseUrl}/bmce/transfer`, transferData, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });
      logInfo('BMCE transfer successful', { transferId: response.data.transferId });
      return response.data;
    } catch (error) {
      logError(error as Error, 'BMCE transfer failed');
      throw error;
    }
  }

  // CIH Bank Integration
  async cihBankTransfer(transferData: {
    fromAccount: string;
    toAccount: string;
    amount: number;
    description: string;
  }) {
    try {
      const response = await axios.post(`${this.baseUrl}/cih/transfer`, transferData, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });
      logInfo('CIH transfer successful', { transferId: response.data.transferId });
      return response.data;
    } catch (error) {
      logError(error as Error, 'CIH transfer failed');
      throw error;
    }
  }

  // Bank Al-Maghrib Integration (Central Bank)
  async bankAlMaghribTransfer(transferData: {
    fromAccount: string;
    toAccount: string;
    amount: number;
    description: string;
  }) {
    try {
      const response = await axios.post(`${this.baseUrl}/bam/transfer`, transferData, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });
      logInfo('Bank Al-Maghrib transfer successful', { transferId: response.data.transferId });
      return response.data;
    } catch (error) {
      logError(error as Error, 'Bank Al-Maghrib transfer failed');
      throw error;
    }
  }

  // Get bank account balance
  async getAccountBalance(bankCode: string, accountNumber: string) {
    try {
      const response = await axios.get(`${this.baseUrl}/${bankCode}/accounts/${accountNumber}/balance`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      });
      return response.data;
    } catch (error) {
      logError(error as Error, 'Failed to get account balance');
      throw error;
    }
  }

  // Get transaction history
  async getTransactionHistory(bankCode: string, accountNumber: string, params: {
    startDate: string;
    endDate: string;
    page?: number;
    limit?: number;
  }) {
    try {
      const response = await axios.get(`${this.baseUrl}/${bankCode}/accounts/${accountNumber}/transactions`, {
        params,
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      });
      return response.data;
    } catch (error) {
      logError(error as Error, 'Failed to get transaction history');
      throw error;
    }
  }

  // Verify bank account
  async verifyAccount(bankCode: string, accountNumber: string) {
    try {
      const response = await axios.post(`${this.baseUrl}/${bankCode}/accounts/verify`, {
        accountNumber
      }, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      logError(error as Error, 'Failed to verify account');
      throw error;
    }
  }

  // Get exchange rates
  async getExchangeRates() {
    try {
      const response = await axios.get(`${this.baseUrl}/exchange-rates`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      });
      return response.data;
    } catch (error) {
      logError(error as Error, 'Failed to get exchange rates');
      throw error;
    }
  }

  // Get bank branches
  async getBankBranches(bankCode: string, params: {
    city?: string;
    region?: string;
    page?: number;
    limit?: number;
  }) {
    try {
      const response = await axios.get(`${this.baseUrl}/${bankCode}/branches`, {
        params,
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      });
      return response.data;
    } catch (error) {
      logError(error as Error, 'Failed to get bank branches');
      throw error;
    }
  }
} 