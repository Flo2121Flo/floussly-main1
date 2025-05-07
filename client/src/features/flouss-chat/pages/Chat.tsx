import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { MessageBubble } from '../components/MessageBubble';
import { VoiceRecorder } from '../components/VoiceRecorder';

interface Message {
  id: string;
  type: 'TEXT' | 'VOICE' | 'SYSTEM' | 'TREASURE';
  content: string;
  timestamp: Date;
  senderId: string;
  status: 'SENT' | 'DELIVERED' | 'SEEN';
  voiceUrl?: string;
  treasureData?: {
    amount: number;
    status: 'LOCKED' | 'UNLOCKING' | 'UNLOCKED' | 'EXPIRED';
  };
}

export const Chat: React.FC = () => {
  const { chatId } = useParams<{ chatId: string }>();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [message, setMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isFriend, setIsFriend] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const currentUserId = 'current-user-id'; // This would come from your auth context

  // This would come from your state management solution
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'TEXT',
      content: 'Hi there!',
      timestamp: new Date(),
      senderId: 'other-user-id',
      status: 'SEEN',
    },
    {
      id: '2',
      type: 'SYSTEM',
      content: 'You claimed 50 MAD from @Sara',
      timestamp: new Date(),
      senderId: 'system',
      status: 'SEEN',
    },
    // Add more mock messages
  ]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!message.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      type: 'TEXT',
      content: message,
      timestamp: new Date(),
      senderId: currentUserId,
      status: 'SENT',
    };

    setMessages([...messages, newMessage]);
    setMessage('');
  };

  const handleVoiceComplete = async (blob: Blob) => {
    // Here you would upload the blob and get a URL
    const voiceUrl = URL.createObjectURL(blob);

    const newMessage: Message = {
      id: Date.now().toString(),
      type: 'VOICE',
      content: '',
      voiceUrl,
      timestamp: new Date(),
      senderId: currentUserId,
      status: 'SENT',
    };

    setMessages([...messages, newMessage]);
    setIsRecording(false);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="sticky top-0 bg-white z-10 p-4 border-b flex items-center gap-4">
        <button onClick={() => navigate('/chat')} className="p-2">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <img
          src="https://i.pravatar.cc/150"
          alt="Chat avatar"
          className="w-10 h-10 rounded-full"
        />
        <div className="flex-1">
          <h2 className="font-semibold">Sara Ahmed</h2>
          <p className="text-sm text-gray-500">{t('chat.online')}</p>
        </div>
      </div>

      {/* Not Friends Warning */}
      {!isFriend && (
        <div className="bg-yellow-50 p-4 text-yellow-800 text-center">
          {t('chat.not_friends_warning')}
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        {messages.map((msg) => (
          <MessageBubble
            key={msg.id}
            type={msg.type}
            content={msg.content}
            timestamp={msg.timestamp}
            isSender={msg.senderId === currentUserId}
            status={msg.status}
            voiceUrl={msg.voiceUrl}
            treasureData={msg.treasureData}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t p-4">
        {isRecording ? (
          <VoiceRecorder
            onRecordingComplete={handleVoiceComplete}
            onCancel={() => setIsRecording(false)}
          />
        ) : (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsRecording(true)}
              className="p-3 text-gray-500 hover:text-gray-700"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            </button>
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={t('chat.type_message')}
              className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            />
            <button
              onClick={handleSend}
              disabled={!message.trim()}
              className="p-3 text-primary disabled:text-gray-400"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}; 