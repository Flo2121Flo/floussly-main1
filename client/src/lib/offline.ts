import { MobileCache } from './performance';

export class OfflineManager {
  private cache: MobileCache;
  private queue: Array<() => Promise<void>> = [];
  private isProcessingQueue = false;

  constructor(cache: MobileCache) {
    this.cache = cache;
    this.registerServiceWorker();
  }

  private async registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        console.log('ServiceWorker registration successful');
      } catch (error) {
        console.error('ServiceWorker registration failed:', error);
      }
    }
  }

  async queueAction<T>(action: () => Promise<T>): Promise<T> {
    if (navigator.onLine) {
      return action();
    }

    return new Promise((resolve, reject) => {
      this.queue.push(async () => {
        try {
          const result = await action();
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });

      this.processQueue();
    });
  }

  private async processQueue() {
    if (this.isProcessingQueue || !navigator.onLine) return;

    this.isProcessingQueue = true;
    while (this.queue.length > 0 && navigator.onLine) {
      const action = this.queue.shift();
      if (action) {
        try {
          await action();
        } catch (error) {
          console.error('Failed to process queued action:', error);
          this.queue.push(action);
        }
      }
    }
    this.isProcessingQueue = false;
  }

  async syncData<T>(key: string, data: T): Promise<void> {
    await this.cache.set(key, data);
    await this.queueAction(async () => {
      // Implement your sync logic here
      console.log('Syncing data:', key, data);
    });
  }

  async getOfflineData<T>(key: string): Promise<T | null> {
    return this.cache.get<T>(key);
  }
}

// Offline status hook
export function useOfflineStatus() {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOffline;
} 