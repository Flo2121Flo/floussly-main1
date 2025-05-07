import { io, Socket } from 'socket.io-client';
import { create } from 'zustand';

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

interface WebSocketStore {
  socket: Socket | null;
  isConnected: boolean;
  messages: Message[];
  connect: () => void;
  disconnect: () => void;
  sendMessage: (message: Omit<Message, 'id' | 'timestamp' | 'status'>) => void;
  markAsSeen: (messageId: string) => void;
}

const SOCKET_URL = process.env.REACT_APP_WEBSOCKET_URL || 'ws://localhost:3001';

export const useWebSocket = create<WebSocketStore>((set, get) => ({
  socket: null,
  isConnected: false,
  messages: [],

  connect: () => {
    const socket = io(SOCKET_URL, {
      auth: {
        token: localStorage.getItem('token'),
      },
    });

    socket.on('connect', () => {
      set({ isConnected: true });
    });

    socket.on('disconnect', () => {
      set({ isConnected: false });
    });

    socket.on('message', (message: Message) => {
      set((state) => ({
        messages: [...state.messages, message],
      }));
    });

    socket.on('message_seen', (messageId: string) => {
      set((state) => ({
        messages: state.messages.map((msg) =>
          msg.id === messageId ? { ...msg, status: 'SEEN' } : msg
        ),
      }));
    });

    set({ socket });
  },

  disconnect: () => {
    const { socket } = get();
    if (socket) {
      socket.disconnect();
      set({ socket: null, isConnected: false });
    }
  },

  sendMessage: (message) => {
    const { socket } = get();
    if (socket) {
      socket.emit('message', message);
    }
  },

  markAsSeen: (messageId) => {
    const { socket } = get();
    if (socket) {
      socket.emit('mark_seen', messageId);
    }
  },
})); 