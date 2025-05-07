import { useState } from 'react';
import { useTranslation } from 'react-i18next';

interface PaymentState {
  loading: boolean;
  error: string | null;
  paymentUrl: string | null;
}

interface PaymentDetails {
  amount: number;
  currency: 'MAD' | 'EUR' | 'USD';
  description: string;
  customerInfo: {
    name: string;
    email: string;
    phone?: string;
  };
  metadata?: Record<string, any>;
}

export const usePayment = () => {
  const [state, setState] = useState<PaymentState>({
    loading: false,
    error: null,
    paymentUrl: null,
  });
  const { t } = useTranslation();

  const initiatePayment = async (details: PaymentDetails) => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const response = await fetch('/api/payments/initiate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(details),
      });

      if (!response.ok) {
        throw new Error(t('payment.errors.initiation_failed'));
      }

      const { paymentUrl } = await response.json();
      setState((prev) => ({
        ...prev,
        paymentUrl,
        loading: false,
      }));

      return paymentUrl;
    } catch (error) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : t('payment.errors.unknown'),
      }));
      throw error;
    }
  };

  const checkPaymentStatus = async (paymentId: string) => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const response = await fetch(`/api/payments/${paymentId}/status`);
      
      if (!response.ok) {
        throw new Error(t('payment.errors.status_check_failed'));
      }

      const { status, transactionId } = await response.json();
      setState((prev) => ({
        ...prev,
        loading: false,
      }));

      return { status, transactionId };
    } catch (error) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : t('payment.errors.unknown'),
      }));
      throw error;
    }
  };

  const processPaymentCallback = async (paymentId: string, provider: 'paydunya' | 'm2t') => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const response = await fetch(`/api/payments/${paymentId}/callback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ provider }),
      });

      if (!response.ok) {
        throw new Error(t('payment.errors.callback_failed'));
      }

      const { success, transactionId } = await response.json();
      setState((prev) => ({
        ...prev,
        loading: false,
      }));

      return { success, transactionId };
    } catch (error) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : t('payment.errors.unknown'),
      }));
      throw error;
    }
  };

  const getPaymentHistory = async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const response = await fetch('/api/payments/history');
      
      if (!response.ok) {
        throw new Error(t('payment.errors.history_failed'));
      }

      const history = await response.json();
      setState((prev) => ({
        ...prev,
        loading: false,
      }));

      return history;
    } catch (error) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : t('payment.errors.unknown'),
      }));
      throw error;
    }
  };

  return {
    ...state,
    initiatePayment,
    checkPaymentStatus,
    processPaymentCallback,
    getPaymentHistory,
  };
}; 