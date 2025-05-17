import { useState, useEffect } from 'react';
import { offlineQueue, QueuedAction } from '../services/offlineQueue';
import NetInfo from '@react-native-community/netinfo';

export const useOfflineQueue = () => {
  const [isOnline, setIsOnline] = useState(true);
  const [queue, setQueue] = useState<QueuedAction[]>([]);
  const [queueStatus, setQueueStatus] = useState(offlineQueue.getQueueStatus());

  useEffect(() => {
    const unsubscribe = offlineQueue.addListener(newQueue => {
      setQueue(newQueue);
      setQueueStatus(offlineQueue.getQueueStatus());
    });

    const netInfoUnsubscribe = NetInfo.addEventListener(state => {
      setIsOnline(!!state.isConnected);
    });

    return () => {
      unsubscribe();
      netInfoUnsubscribe();
    };
  }, []);

  const addToQueue = async (action: Omit<QueuedAction, 'id' | 'timestamp' | 'retryCount' | 'status'>) => {
    return offlineQueue.addAction(action);
  };

  const clearCompleted = async () => {
    await offlineQueue.clearCompleted();
  };

  return {
    isOnline,
    queue,
    queueStatus,
    addToQueue,
    clearCompleted
  };
}; 