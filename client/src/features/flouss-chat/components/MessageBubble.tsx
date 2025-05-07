import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { formatDistanceToNow } from 'date-fns';
import { AddMoneyPrompt } from './AddMoneyPrompt';
import { AddMoneyModal } from './AddMoneyModal';

interface MessageBubbleProps {
  type: 'TEXT' | 'VOICE' | 'SYSTEM' | 'TREASURE';
  content: string;
  timestamp: Date;
  isSender: boolean;
  status?: 'SENT' | 'DELIVERED' | 'SEEN';
  voiceUrl?: string;
  treasureData?: {
    amount: number;
    status: 'LOCKED' | 'UNLOCKING' | 'UNLOCKED' | 'EXPIRED';
  };
}

const MONEY_KEYWORDS = [
  'add funds',
  'top up',
  'charge wallet',
  'i need money',
  'i\'m out of cash',
  'low balance',
  'need money',
  'add money',
];

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  type,
  content,
  timestamp,
  isSender,
  status = 'SENT',
  voiceUrl,
  treasureData,
}) => {
  const { t } = useTranslation();
  const [showAddMoneyPrompt, setShowAddMoneyPrompt] = useState(false);
  const [showAddMoneyModal, setShowAddMoneyModal] = useState(false);
  const [selectedAmount, setSelectedAmount] = useState<number>(0);

  const shouldShowAddMoneyPrompt = type === 'TEXT' && !isSender && 
    MONEY_KEYWORDS.some(keyword => content.toLowerCase().includes(keyword));

  const handleAddMoney = (amount: number) => {
    setSelectedAmount(amount);
    setShowAddMoneyModal(true);
    setShowAddMoneyPrompt(false);
  };

  const handleCustomAmount = () => {
    setShowAddMoneyModal(true);
    setShowAddMoneyPrompt(false);
  };

  const handleAddMoneySuccess = (amount: number) => {
    // Here you would send a system message about the successful top-up
    setShowAddMoneyModal(false);
  };

  const getBubbleStyle = () => {
    const baseStyle = 'rounded-lg p-3 max-w-[80%] break-words';
    if (type === 'SYSTEM') {
      return `${baseStyle} bg-gray-100 text-gray-600 mx-auto`;
    }
    return isSender
      ? `${baseStyle} bg-primary text-white ml-auto`
      : `${baseStyle} bg-gray-200 text-gray-800`;
  };

  const renderContent = () => {
    switch (type) {
      case 'VOICE':
        return (
          <div className="flex items-center gap-2">
            <button className="p-2 rounded-full bg-white/20">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" />
              </svg>
            </button>
            <div className="w-32 h-8 bg-white/20 rounded-full" />
          </div>
        );

      case 'TREASURE':
        return (
          <div className="flex flex-col gap-2 animate-pulse">
            <div className="flex items-center gap-2">
              <span role="img" aria-label="treasure">🪙</span>
              <span>{t('treasure.amount', { amount: treasureData?.amount })}</span>
            </div>
            <div className={`text-sm ${treasureData?.status === 'EXPIRED' ? 'text-red-500' : ''}`}>
              {t(`treasure.status.${treasureData?.status?.toLowerCase()}`)}
            </div>
          </div>
        );

      case 'SYSTEM':
        return <div className="text-center text-sm">{content}</div>;

      default:
        return <div>{content}</div>;
    }
  };

  return (
    <div className={`flex flex-col gap-1 mb-4 ${isSender ? 'items-end' : 'items-start'}`}>
      <div className={getBubbleStyle()}>
        {renderContent()}
      </div>
      <div className="flex items-center gap-2 text-xs text-gray-500">
        <span>{formatDistanceToNow(timestamp, { addSuffix: true })}</span>
        {isSender && (
          <span>
            {status === 'SEEN' && '👁️'}
            {status === 'DELIVERED' && '✓✓'}
            {status === 'SENT' && '✓'}
          </span>
        )}
      </div>

      {shouldShowAddMoneyPrompt && showAddMoneyPrompt && (
        <AddMoneyPrompt
          onAddMoney={handleAddMoney}
          onCustomAmount={handleCustomAmount}
          onDismiss={() => setShowAddMoneyPrompt(false)}
        />
      )}

      {showAddMoneyModal && (
        <AddMoneyModal
          amount={selectedAmount}
          onClose={() => setShowAddMoneyModal(false)}
          onSuccess={handleAddMoneySuccess}
        />
      )}
    </div>
  );
}; 