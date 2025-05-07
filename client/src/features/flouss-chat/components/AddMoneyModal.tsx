import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

interface AddMoneyModalProps {
  amount: number;
  onClose: () => void;
  onSuccess: (amount: number) => void;
}

type PaymentMethod = 'PAYDUNYA' | 'M2T' | 'CARD';

export const AddMoneyModal: React.FC<AddMoneyModalProps> = ({
  amount,
  onClose,
  onSuccess,
}) => {
  const { t } = useTranslation();
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const paymentMethods: { id: PaymentMethod; icon: string; label: string }[] = [
    { id: 'PAYDUNYA', icon: '🏪', label: 'PayDunya' },
    { id: 'M2T', icon: '🏦', label: 'M2T' },
    { id: 'CARD', icon: '💳', label: t('payment.card') },
  ];

  const handlePayment = async (method: PaymentMethod) => {
    setIsProcessing(true);
    try {
      // Here you would integrate with the actual payment provider
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API call
      onSuccess(amount);
    } catch (error) {
      console.error('Payment failed:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-md p-6 animate-slide-up">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">{t('payment.add_money')}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="text-center mb-6">
          <div className="text-4xl font-bold text-primary mb-2">
            {amount} MAD
          </div>
          <p className="text-gray-600">{t('payment.select_method')}</p>
        </div>

        <div className="space-y-3">
          {paymentMethods.map((method) => (
            <button
              key={method.id}
              onClick={() => handlePayment(method.id)}
              disabled={isProcessing}
              className={`w-full p-4 border rounded-lg flex items-center gap-3 transition-colors ${
                selectedMethod === method.id
                  ? 'border-primary bg-primary/5'
                  : 'hover:bg-gray-50'
              }`}
            >
              <span className="text-2xl">{method.icon}</span>
              <span className="font-medium">{method.label}</span>
            </button>
          ))}
        </div>

        {isProcessing && (
          <div className="mt-4 text-center text-gray-600">
            {t('payment.processing')}...
          </div>
        )}
      </div>
    </div>
  );
}; 