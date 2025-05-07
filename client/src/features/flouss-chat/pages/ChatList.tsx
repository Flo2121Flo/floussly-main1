import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

interface Chat {
  id: string;
  name: string;
  lastMessage: {
    content: string;
    type: 'TEXT' | 'VOICE' | 'SYSTEM' | 'TREASURE';
    timestamp: Date;
  };
  unreadCount: number;
  avatar?: string;
}

export const ChatList: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  // This would come from your state management solution
  const chats: Chat[] = [
    {
      id: '1',
      name: 'Sara Ahmed',
      lastMessage: {
        content: 'Thank you for the transfer!',
        type: 'TEXT',
        timestamp: new Date(),
      },
      unreadCount: 2,
      avatar: 'https://i.pravatar.cc/150?u=sara',
    },
    // Add more mock data as needed
  ];

  const getMessagePreview = (message: Chat['lastMessage']) => {
    switch (message.type) {
      case 'VOICE':
        return t('chat.voice_message');
      case 'TREASURE':
        return t('chat.treasure_message');
      case 'SYSTEM':
        return message.content;
      default:
        return message.content;
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="sticky top-0 bg-white z-10 p-4 border-b">
        <h1 className="text-2xl font-bold">{t('chat.title')}</h1>
      </div>

      <div className="flex-1 overflow-y-auto">
        {chats.map((chat) => (
          <div
            key={chat.id}
            onClick={() => navigate(`/chat/${chat.id}`)}
            className="flex items-center gap-4 p-4 border-b hover:bg-gray-50 cursor-pointer"
          >
            <div className="relative">
              <img
                src={chat.avatar || 'https://i.pravatar.cc/150'}
                alt={chat.name}
                className="w-12 h-12 rounded-full"
              />
              {chat.unreadCount > 0 && (
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-white rounded-full flex items-center justify-center text-xs">
                  {chat.unreadCount}
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold truncate">{chat.name}</h3>
                <span className="text-sm text-gray-500">
                  {new Intl.DateTimeFormat(undefined, {
                    hour: 'numeric',
                    minute: 'numeric',
                  }).format(chat.lastMessage.timestamp)}
                </span>
              </div>
              <p className="text-sm text-gray-600 truncate">
                {getMessagePreview(chat.lastMessage)}
              </p>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={() => navigate('/contacts')}
        className="fixed bottom-20 right-4 w-14 h-14 bg-primary text-white rounded-full flex items-center justify-center shadow-lg"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      </button>
    </div>
  );
}; 