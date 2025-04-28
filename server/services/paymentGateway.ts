import axios from 'axios';
import { Transaction } from '../types/transaction';

const PAYDUNYA_API_KEY = process.env.PAYDUNYA_API_KEY;
const PAYDUNYA_SECRET_KEY = process.env.PAYDUNYA_SECRET_KEY;
const M2T_API_KEY = process.env.M2T_API_KEY;
const M2T_SECRET_KEY = process.env.M2T_SECRET_KEY;

export class PaymentGateway {
  static async processCardTopup(transaction: Transaction) {
    try {
      // Process through PayDunya
      const response = await axios.post('https://api.paydunya.com/v1/checkout-invoice/create', {
        total_amount: transaction.totalAmount,
        description: 'Wallet Top-up',
        callback_url: `${process.env.API_URL}/webhooks/paydunya`,
        return_url: `${process.env.FRONTEND_URL}/transactions/${transaction.id}`,
        cancel_url: `${process.env.FRONTEND_URL}/transactions/${transaction.id}`,
        metadata: {
          transactionId: transaction.id,
          userId: transaction.userId
        }
      }, {
        headers: {
          'PAYDUNYA-MASTER-KEY': PAYDUNYA_API_KEY,
          'PAYDUNYA-PRIVATE-KEY': PAYDUNYA_SECRET_KEY
        }
      });

      return {
        success: true,
        paymentUrl: response.data.response_text,
        paymentToken: response.data.token
      };
    } catch (error) {
      console.error('PayDunya error:', error);
      throw new Error('Payment processing failed');
    }
  }

  static async processBankWithdrawal(transaction: Transaction) {
    try {
      // Process through M2T
      const response = await axios.post('https://api.m2t.com/v1/transfers', {
        amount: transaction.amount,
        currency: 'MAD',
        beneficiary: {
          account_number: transaction.metadata?.bankAccount,
          bank_name: transaction.metadata?.bankName
        },
        description: 'Wallet Withdrawal',
        reference: transaction.id
      }, {
        headers: {
          'Authorization': `Bearer ${M2T_API_KEY}`,
          'X-Secret-Key': M2T_SECRET_KEY
        }
      });

      return {
        success: true,
        transferId: response.data.transfer_id
      };
    } catch (error) {
      console.error('M2T error:', error);
      throw new Error('Bank withdrawal failed');
    }
  }

  static async verifyPayment(token: string) {
    try {
      const response = await axios.get(`https://api.paydunya.com/v1/checkout-invoice/confirm/${token}`, {
        headers: {
          'PAYDUNYA-MASTER-KEY': PAYDUNYA_API_KEY,
          'PAYDUNYA-PRIVATE-KEY': PAYDUNYA_SECRET_KEY
        }
      });

      return {
        success: response.data.status === 'completed',
        amount: response.data.amount,
        metadata: response.data.metadata
      };
    } catch (error) {
      console.error('Payment verification error:', error);
      throw new Error('Payment verification failed');
    }
  }
} 