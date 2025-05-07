import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ChatList } from '../features/flouss-chat/pages/ChatList';
import { Chat } from '../features/flouss-chat/pages/Chat';
import { useLocation } from 'wouter';

export default function FloussChat() {
  const { t } = useTranslation();
  const [location, setLocation] = useLocation();
  const [showAddMoneyModal, setShowAddMoneyModal] = useState(false);
  const [selectedAmount, setSelectedAmount] = useState<number>(0);

  // Extract chatId from URL if we're in a chat
  const chatId = location.split('/').pop();
  const isInChat = chatId && chatId !== 'chat';

  const handleAddMoney = (amount: number) => {
    setSelectedAmount(amount);
    setShowAddMoneyModal(true);
  };

  const handleAddMoneySuccess = (amount: number) => {
    // Here you would send a system message about the successful top-up
    setShowAddMoneyModal(false);
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background border-b">
        <div className="flex items-center justify-between p-4">
          <h1 className="text-2xl font-bold">
            {isInChat ? t('chat.title') : t('chat.conversations')}
          </h1>
          {!isInChat && (
            <button
              onClick={() => setLocation('/contacts')}
              className="p-2 text-primary hover:bg-primary/5 rounded-full"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        {isInChat ? (
          <Chat
            chatId={chatId}
            onAddMoney={handleAddMoney}
          />
        ) : (
          <ChatList />
        )}
      </div>

      {/* Add Money Modal */}
      {showAddMoneyModal && (
        <AddMoneyModal
          amount={selectedAmount}
          onClose={() => setShowAddMoneyModal(false)}
          onSuccess={handleAddMoneySuccess}
        />
      )}
    </div>
  );
} 