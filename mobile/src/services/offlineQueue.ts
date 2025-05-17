import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { api } from './api';

export type QueuedAction = {
  id: string;
  type: 'contribution' | 'agentAction' | 'kycUpload';
  payload: any;
  timestamp: number;
  retryCount: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
};

const QUEUE_STORAGE_KEY = '@floussly/offline_queue';
const MAX_RETRY_COUNT = 3;

class OfflineQueue {
  private queue: QueuedAction[] = [];
  private isProcessing: boolean = false;
  private listeners: Set<(queue: QueuedAction[]) => void> = new Set();

  constructor() {
    this.initialize();
    this.setupNetworkListener();
  }

  private async initialize() {
    try {
      const storedQueue = await AsyncStorage.getItem(QUEUE_STORAGE_KEY);
      if (storedQueue) {
        this.queue = JSON.parse(storedQueue);
      }
    } catch (error) {
      console.error('Failed to initialize offline queue:', error);
    }
  }

  private setupNetworkListener() {
    NetInfo.addEventListener(state => {
      if (state.isConnected) {
        this.processQueue();
      }
    });
  }

  private async saveQueue() {
    try {
      await AsyncStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(this.queue));
      this.notifyListeners();
    } catch (error) {
      console.error('Failed to save offline queue:', error);
    }
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener(this.queue));
  }

  public addListener(listener: (queue: QueuedAction[]) => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  public async addAction(action: Omit<QueuedAction, 'id' | 'timestamp' | 'retryCount' | 'status'>) {
    const queuedAction: QueuedAction = {
      ...action,
      id: Math.random().toString(36).substring(7),
      timestamp: Date.now(),
      retryCount: 0,
      status: 'pending'
    };

    this.queue.push(queuedAction);
    await this.saveQueue();

    const netInfo = await NetInfo.fetch();
    if (netInfo.isConnected) {
      this.processQueue();
    }

    return queuedAction.id;
  }

  private async processQueue() {
    if (this.isProcessing) return;
    this.isProcessing = true;

    try {
      const pendingActions = this.queue.filter(
        action => action.status === 'pending' && action.retryCount < MAX_RETRY_COUNT
      );

      for (const action of pendingActions) {
        action.status = 'processing';
        await this.saveQueue();

        try {
          switch (action.type) {
            case 'contribution':
              await api.post(`/group-savings/${action.payload.groupId}/contribute`, {
                amount: action.payload.amount
              });
              break;
            case 'agentAction':
              await api.patch(`/agents/${action.payload.agentId}/status`, {
                status: action.payload.status
              });
              break;
            case 'kycUpload':
              await api.post('/kyc/upload', action.payload);
              break;
          }

          action.status = 'completed';
        } catch (error) {
          action.retryCount++;
          action.status = action.retryCount >= MAX_RETRY_COUNT ? 'failed' : 'pending';
        }

        await this.saveQueue();
      }
    } finally {
      this.isProcessing = false;
    }
  }

  public getQueueStatus() {
    return {
      total: this.queue.length,
      pending: this.queue.filter(a => a.status === 'pending').length,
      processing: this.queue.filter(a => a.status === 'processing').length,
      completed: this.queue.filter(a => a.status === 'completed').length,
      failed: this.queue.filter(a => a.status === 'failed').length
    };
  }

  public async clearCompleted() {
    this.queue = this.queue.filter(action => action.status !== 'completed');
    await this.saveQueue();
  }
}

export const offlineQueue = new OfflineQueue(); 