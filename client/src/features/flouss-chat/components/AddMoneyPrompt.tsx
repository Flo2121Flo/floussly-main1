import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

interface AddMoneyPromptProps {
  onAddMoney: (amount: number) => void;
  onCustomAmount: () => void;
  onDismiss: () => void;
}

export const AddMoneyPrompt: React.FC<AddMoneyPromptProps> = ({
  onAddMoney,
  onCustomAmount,
  onDismiss,
}) => {
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(false);

  const presetAmounts = [50, 100, 200, 500];

  return (
    <div className="bg-primary/5 rounded-lg p-4 mb-4 animate-fade-in">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-medium text-primary">
          {t('chat.add_money_prompt')}
        </h3>
        <button
          onClick={onDismiss}
          className="text-gray-500 hover:text-gray-700"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {presetAmounts.map((amount) => (
          <button
            key={amount}
            onClick={() => onAddMoney(amount)}
            className="p-3 bg-white border border-primary/20 rounded-lg hover:bg-primary/5 transition-colors"
          >
            <span className="font-medium">+{amount} MAD</span>
          </button>
        ))}
      </div>

      <button
        onClick={onCustomAmount}
        className="w-full mt-2 p-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
      >
        {t('chat.custom_amount')}
 