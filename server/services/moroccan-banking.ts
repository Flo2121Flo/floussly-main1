import axios from 'axios';
import { config } from '../config';
import { logError, logInfo } from '../utils/logger';
import { CircuitBreakerRegistry } from '../utils/circuit-breaker';
import { ExternalServiceError } from '../utils/enhanced-error';

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
  private m2tBaseUrl: string;
  private m2tApiKey: string;
  private m2tSecretKey: string;
  private cmiBaseUrl: string;
  private cmiApiKey: string;
  private bankAlMaghribBaseUrl: string;
  private bankAlMaghribApiKey: string;
  private circuitBreakerRegistry: CircuitBreakerRegistry;

  private constructor() {
    this.m2tBaseUrl = config.moroccanBank.m2t.baseUrl;
    this.m2tApiKey = config.moroccanBank.m2t.apiKey;
    this.m2tSecretKey = config.moroccanBank.m2t.secretKey;
    this.cmiBaseUrl = config.moroccanBank.cmi.baseUrl;
    this.cmiApiKey = config.moroccanBank.cmi.apiKey;
    this.bankAlMaghribBaseUrl = config.moroccanBank.bankAlMaghrib.baseUrl;
    this.bankAlMaghribApiKey = config.moroccanBank.bankAlMaghrib.apiKey;
    this.circuitBreakerRegistry = CircuitBreakerRegistry.getInstance();
  }

  public static getInstance(): MoroccanBankingService {
    if (!MoroccanBankingService.instance) {
      MoroccanBankingService.instance = new MoroccanBankingService();
    }
    return MoroccanBankingService.instance;
  }

  // M2T API Methods
  async getM2TAccountBalance(accountNumber: string): Promise<number> {
    const breaker = this.circuitBreakerRegistry.getBreaker('m2t-balance', {
      failureThreshold: 3,
      resetTimeout: 30000,
    });

    return breaker.execute(
      async () => {
        try {
          const response = await axios.get(`${this.m2tBaseUrl}/accounts/${accountNumber}/balance`, {
            headers: {
              'Authorization': `Bearer ${this.m2tApiKey}`,
              'X-Secret-Key': this.m2tSecretKey
            },
            timeout: 5000
          });
          return response.data.balance;
        } catch (error) {
          logError(new Error('Failed to get M2T account balance'), 'MoroccanBankingService');
          throw new ExternalServiceError('M2T', 'Failed to get account balance', { accountNumber, error });
        }
      },
      async () => {
        // Fallback: Return cached balance or throw error
        throw new ExternalServiceError('M2T', 'Service unavailable', { accountNumber });
      }
    );
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
    const breaker = this.circuitBreakerRegistry.getBreaker('cmi-account', {
      failureThreshold: 3,
      resetTimeout: 30000,
    });

    return breaker.execute(
      async () => {
        try {
          const response = await axios.get(`${this.cmiBaseUrl}/accounts/${accountNumber}`, {
            headers: {
              'Authorization': `Bearer ${this.cmiApiKey}`
            },
            timeout: 5000
          });
          return response.data;
        } catch (error) {
          logError(new Error('Failed to get CMI account details'), 'MoroccanBankingService');
          throw new ExternalServiceError('CMI', 'Failed to get account details', { accountNumber, error });
        }
      },
      async () => {
        // Fallback: Return cached account details or throw error
        throw new ExternalServiceError('CMI', 'Service unavailable', { accountNumber });
      }
    );
  }

  async getCMITransactions(accountNumber: string, startDate: string, endDate: string): Promise<Transaction[]> {
    const breaker = this.circuitBreakerRegistry.getBreaker('cmi-transactions', {
      failureThreshold: 3,
      resetTimeout: 30000,
    });

    return breaker.execute(
      async () => {
        try {
          const response = await axios.get(`${this.cmiBaseUrl}/accounts/${accountNumber}/transactions`, {
            params: { startDate, endDate },
            headers: {
              'Authorization': `Bearer ${this.cmiApiKey}`
            },
            timeout: 5000
          });
          return response.data.transactions;
        } catch (error) {
          logError(new Error('Failed to get CMI transactions'), 'MoroccanBankingService');
          throw new ExternalServiceError('CMI', 'Failed to get transactions', { accountNumber, startDate, endDate, error });
        }
      },
      async () => {
        // Fallback: Return cached transactions or throw error
        throw new ExternalServiceError('CMI', 'Service unavailable', { accountNumber, startDate, endDate });
      }
    );
  }

  // Bank Al Maghrib API Methods
  async getExchangeRate(fromCurrency: string, toCurrency: string): Promise<number> {
    const breaker = this.circuitBreakerRegistry.getBreaker('bank-al-maghrib-exchange', {
      failureThreshold: 3,
      resetTimeout: 30000,
    });

    return breaker.execute(
      async () => {
        try {
          const response = await axios.get(`${this.bankAlMaghribBaseUrl}/exchange-rates`, {
            params: { fromCurrency, toCurrency },
            headers: {
              'Authorization': `Bearer ${this.bankAlMaghribApiKey}`
            },
            timeout: 5000
          });
          return response.data.rate;
        } catch (error) {
          logError(new Error('Failed to get exchange rate'), 'MoroccanBankingService');
          throw new ExternalServiceError('Bank Al Maghrib', 'Failed to get exchange rate', { fromCurrency, toCurrency, error });
        }
      },
      async () => {
        // Fallback: Return cached exchange rate or throw error
        throw new ExternalServiceError('Bank Al Maghrib', 'Service unavailable', { fromCurrency, toCurrency });
      }
    );
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
    const breaker = this.circuitBreakerRegistry.getBreaker('bank-balance', {
      failureThreshold: 3,
      resetTimeout: 30000,
    });

    return breaker.execute(
      async () => {
        try {
          const response = await axios.get(`${this.bankAlMaghribBaseUrl}/banks/${bankCode}/accounts/${accountNumber}/balance`, {
            headers: {
              'Authorization': `Bearer ${this.bankAlMaghribApiKey}`
            },
            timeout: 5000
          });
          return response.data.balance;
        } catch (error) {
          logError(new Error('Failed to get account balance'), 'MoroccanBankingService');
          throw new ExternalServiceError('Bank Al Maghrib', 'Failed to get account balance', { bankCode, accountNumber, error });
        }
      },
      async () => {
        // Fallback: Return cached balance or throw error
        throw new ExternalServiceError('Bank Al Maghrib', 'Service unavailable', { bankCode, accountNumber });
      }
    );
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