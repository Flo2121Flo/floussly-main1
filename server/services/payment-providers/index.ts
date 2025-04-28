import { PaymentProvider } from '../../types/payment';
import axios from 'axios';

interface PayDunyaResponse {
  success: boolean;
  reference?: string;
  error?: string;
}

interface VerificationResponse {
  success: boolean;
  status: 'pending' | 'completed' | 'failed';
  error?: string;
}

class PayDunyaProvider implements PaymentProvider {
  name = 'paydunya';
  private apiKey: string;
  private apiSecret: string;
  private baseUrl: string;

  constructor(apiKey: string, apiSecret: string, baseUrl: string) {
    this.apiKey = apiKey;
    this.apiSecret = apiSecret;
    this.baseUrl = baseUrl;
  }

  async initializePayment(amount: number, currency: string): Promise<string> {
    try {
      const response = await axios.post<PayDunyaResponse>(
        `${this.baseUrl}/payments/create`,
        {
          amount,
          currency,
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'X-API-Secret': this.apiSecret,
          },
        }
      );

      const data = response.data;
      if (!data.success || !data.reference) {
        throw new Error(data.error || 'Failed to initialize payment');
      }

      return data.reference;
    } catch (error) {
      const paymentError = error as { response?: { data?: { message?: string } }; message?: string };
      const errorMessage = paymentError.response?.data?.message || paymentError.message || 'Unknown error';
      throw new Error(`Payment initialization failed: ${errorMessage}`);
    }
  }

  async verifyPayment(reference: string): Promise<boolean> {
    try {
      const response = await axios.get<VerificationResponse>(
        `${this.baseUrl}/payments/${reference}/verify`,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'X-API-Secret': this.apiSecret,
          },
        }
      );

      const data = response.data;
      if (!data.success) {
        throw new Error(data.error || 'Payment verification failed');
      }

      return data.status === 'completed';
    } catch (error) {
      const paymentError = error as { response?: { data?: { message?: string } }; message?: string };
      const errorMessage = paymentError.response?.data?.message || paymentError.message || 'Unknown error';
      throw new Error(`Payment verification failed: ${errorMessage}`);
    }
  }
}

// Export providers
export const providers = {
  PayDunya: PayDunyaProvider,
}; 