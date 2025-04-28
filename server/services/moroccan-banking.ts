import axios from 'axios';
import { logError, logInfo } from '../utils/logger';

interface BankAccount {
  accountNumber: string;
  accountType: string;
  currency: string;
  balance: number;
}

interface Transaction {
  id: string;
  amount: number;
  currency: string;
  type: 'credit' | 'debit';
  description: string;
  date: string;
  status: 'pending' | 'completed' | 'failed';
}

interface BankTransfer {
  fromAccount: string;
  toAccount: string;
  amount: number;
  currency: string;
  description: string;
}

export class MoroccanBankingService {
  private static instance: MoroccanBankingService;
  private readonly m2tApiKey: string;
  private readonly m2tSecretKey: string;
  private readonly m2tBaseUrl: string;
  private readonly cmiApiKey: string;
  private readonly cmiBaseUrl: string;
  private readonly bankAlMaghribApiKey: string;
  private readonly bankAlMaghribBaseUrl: string;

  private constructor() {
    this.m2tApiKey = process.env.M2T_API_KEY || '';
    this.m2tSecretKey = process.env.M2T_SECRET_KEY || '';
    this.m2tBaseUrl = process.env.M2T_BASE_URL || 'https://api.m2t.ma';
    this.cmiApiKey = process.env.CMI_API_KEY || '';
    this.cmiBaseUrl = process.env.CMI_BASE_URL || 'https://api.cmi.ma';
    this.bankAlMaghribApiKey = process.env.BANK_AL_MAGHRIB_API_KEY || '';
    this.bankAlMaghribBaseUrl = process.env.BANK_AL_MAGHRIB_BASE_URL || 'https://api.bam.ma';
  }

  public static getInstance(): MoroccanBankingService {
    if (!MoroccanBankingService.instance) {
      MoroccanBankingService.instance = new MoroccanBankingService();
    }
    return MoroccanBankingService.instance;
  }

  // M2T API Methods
  async getM2TAccountBalance(accountNumber: string): Promise<number> {
    try {
      const response = await axios.get(`${this.m2tBaseUrl}/accounts/${accountNumber}/balance`, {
        headers: {
          'Authorization': `Bearer ${this.m2tApiKey}`,
          'X-Secret-Key': this.m2tSecretKey
        }
      });
      return response.data.balance;
    } catch (error) {
      logError(new Error('Failed to get M2T account balance'), 'MoroccanBankingService');
      throw error;
    }
  }

  async initiateM2TTransfer(transfer: BankTransfer): Promise<string> {
    try {
      const response = await axios.post(`${this.m2tBaseUrl}/transfers`, transfer, {
        headers: {
          'Authorization': `Bearer ${this.m2tApiKey}`,
          'X-Secret-Key': this.m2tSecretKey
        }
      });
      return response.data.transactionId;
    } catch (error) {
      logError(new Error('Failed to initiate M2T transfer'), 'MoroccanBankingService');
      throw error;
    }
  }

  // CMI API Methods
  async getCMIAccountDetails(accountNumber: string): Promise<BankAccount> {
    try {
      const response = await axios.get(`${this.cmiBaseUrl}/accounts/${accountNumber}`, {
        headers: {
          'Authorization': `Bearer ${this.cmiApiKey}`
        }
      });
      return response.data;
    } catch (error) {
      logError(new Error('Failed to get CMI account details'), 'MoroccanBankingService');
      throw error;
    }
  }

  async getCMITransactions(accountNumber: string, startDate: string, endDate: string): Promise<Transaction[]> {
    try {
      const response = await axios.get(`${this.cmiBaseUrl}/accounts/${accountNumber}/transactions`, {
        params: { startDate, endDate },
        headers: {
          'Authorization': `Bearer ${this.cmiApiKey}`
        }
      });
      return response.data.transactions;
    } catch (error) {
      logError(new Error('Failed to get CMI transactions'), 'MoroccanBankingService');
      throw error;
    }
  }

  // Bank Al Maghrib API Methods
  async getExchangeRate(fromCurrency: string, toCurrency: string): Promise<number> {
    try {
      const response = await axios.get(`${this.bankAlMaghribBaseUrl}/exchange-rates`, {
        params: { fromCurrency, toCurrency },
        headers: {
          'Authorization': `Bearer ${this.bankAlMaghribApiKey}`
        }
      });
      return response.data.rate;
    } catch (error) {
      logError(new Error('Failed to get exchange rate'), 'MoroccanBankingService');
      throw error;
    }
  }

  async getBankHolidays(year: number): Promise<string[]> {
    try {
      const response = await axios.get(`${this.bankAlMaghribBaseUrl}/holidays/${year}`, {
        headers: {
          'Authorization': `Bearer ${this.bankAlMaghribApiKey}`
        }
      });
      return response.data.holidays;
    } catch (error) {
      logError(new Error('Failed to get bank holidays'), 'MoroccanBankingService');
      throw error;
    }
  }

  // Generic Bank API Methods
  async getAccountBalance(bankCode: string, accountNumber: string): Promise<number> {
    try {
      const response = await axios.get(`${this.bankAlMaghribBaseUrl}/banks/${bankCode}/accounts/${accountNumber}/balance`, {
        headers: {
          'Authorization': `Bearer ${this.bankAlMaghribApiKey}`
        }
      });
      return response.data.balance;
    } catch (error) {
      logError(new Error('Failed to get account balance'), 'MoroccanBankingService');
      throw error;
    }
  }

  async initiateBankTransfer(bankCode: string, transfer: BankTransfer): Promise<string> {
    try {
      const response = await axios.post(`${this.bankAlMaghribBaseUrl}/banks/${bankCode}/transfers`, transfer, {
        headers: {
          'Authorization': `Bearer ${this.bankAlMaghribApiKey}`
        }
      });
      return response.data.transactionId;
    } catch (error) {
      logError(new Error('Failed to initiate bank transfer'), 'MoroccanBankingService');
      throw error;
    }
  }

  // Bank List
  getSupportedBanks(): { code: string; name: string; logo: string }[] {
    return [
      { code: 'M2T', name: 'M2T', logo: 'https://m2t.ma/logo.png' },
      { code: 'CMI', name: 'CMI', logo: 'https://cmi.ma/logo.png' },
      { code: 'ATTIJARI', name: 'Attijariwafa Bank', logo: 'https://attijari.ma/logo.png' },
      { code: 'BMCE', name: 'BMCE Bank', logo: 'https://bmce.ma/logo.png' },
      { code: 'BMCI', name: 'BMCI', logo: 'https://bmci.ma/logo.png' },
      { code: 'SGMB', name: 'Société Générale Maroc', logo: 'https://sgmb.ma/logo.png' },
      { code: 'CFG', name: 'CFG Bank', logo: 'https://cfg.ma/logo.png' },
      { code: 'CIH', name: 'CIH Bank', logo: 'https://cih.ma/logo.png' },
      { code: 'BANKOF', name: 'Bank Of Africa', logo: 'https://boa.ma/logo.png' }
    ];
  }
} 