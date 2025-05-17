import { useState, useEffect, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import { useAuth } from './useAuth';
import { useWebSocket } from './useWebSocket';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'support';
  timestamp: Date;
  attachments?: {
    type: 'image' | 'file';
    url: string;
    name: string;
  }[];
}

interface SendMessageParams {
  text: string;
  attachments?: Message['attachments'];
}

export const useSupportChat = () => {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  // Fetch initial messages
  const { data: messages = [], isLoading, error } = useQuery({
    queryKey: ['supportChat'],
    queryFn: async () => {
      const response = await api.get('/support/chat', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data.map((msg: any) => ({
        ...msg,
        timestamp: new Date(msg.timestamp)
      }));
    },
    enabled: !!token
  });

  // WebSocket connection for real-time updates
  const { socket, isConnected } = useWebSocket(
    `${process.env.EXPO_PUBLIC_WS_URL}/support/chat`,
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );

  // Handle incoming messages
  useEffect(() => {
    if (!socket) return;

    const handleMessage = (event: MessageEvent) => {
      const data = JSON.parse(event.data);
      
      if (data.type === 'message') {
        queryClient.setQueryData(['supportChat'], (old: Message[] = []) => [
          ...old,
          {
            ...data.message,
            timestamp: new Date(data.message.timestamp)
          }
        ]);
      } else if (data.type === 'typing') {
        setIsTyping(data.isTyping);
      }
    };

    socket.addEventListener('message', handleMessage);
    return () => socket.removeEventListener('message', handleMessage);
  }, [socket, queryClient]);

  // Send message
  const sendMessage = useCallback(async ({ text, attachments }: SendMessageParams) => {
    if (!socket || !isConnected) {
      throw new Error('WebSocket connection is not available');
    }

    // Upload attachments if any
    let uploadedAttachments;
    if (attachments?.length) {
      const formData = new FormData();
      attachments.forEach((attachment, index) => {
        formData.append(`file${index}`, {
          uri: attachment.url,
          type: attachment.type === 'image' ? 'image/jpeg' : 'application/octet-stream',
          name: attachment.name
        } as any);
      });

      const response = await api.post('/support/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`
        }
      });

      uploadedAttachments = response.data.urls.map((url: string, index: number) => ({
        type: attachments[index].type,
        url,
        name: attachments[index].name
      }));
    }

    // Send message through WebSocket
    socket.send(JSON.stringify({
      type: 'message',
      text,
      attachments: uploadedAttachments
    }));

    // Update local state
    queryClient.setQueryData(['supportChat'], (old: Message[] = []) => [
      ...old,
      {
        id: Date.now().toString(),
        text,
        sender: 'user',
        timestamp: new Date(),
        attachments: uploadedAttachments
      }
    ]);
  }, [socket, isConnected, token, queryClient]);

  // Handle typing indicator
  const handleTyping = useCallback(() => {
    if (!socket || !isConnected) return;

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Send typing indicator
    socket.send(JSON.stringify({ type: 'typing', isTyping: true }));

    // Set timeout to stop typing indicator
    typingTimeoutRef.current = setTimeout(() => {
      socket.send(JSON.stringify({ type: 'typing', isTyping: false }));
    }, 2000);
  }, [socket, isConnected]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    isTyping,
    handleTyping,
    isConnected
  };
}; 