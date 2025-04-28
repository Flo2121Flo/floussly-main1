import { lazy, Suspense } from 'react';
import { Cache, CacheConfig } from './types';

// Lazy loading wrapper
export function lazyLoad<T extends React.ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  fallback?: React.ReactNode
) {
  const LazyComponent = lazy(importFn);
  return (props: React.ComponentProps<T>) => (
    <Suspense fallback={fallback || <div>Loading...</div>}>
      <LazyComponent {...props} />
    </Suspense>
  );
}

// Image optimization
export function optimizeImage(url: string, width: number, height: number): string {
  return `${url}?w=${width}&h=${height}&q=80&auto=format&fit=crop`;
}

// Cache implementation
export class MobileCache {
  private cache: Map<string, Cache>;
  private config: CacheConfig;

  constructor(config: CacheConfig) {
    this.cache = new Map();
    this.config = config;
  }

  async get<T>(key: string): Promise<T | null> {
    const cached = this.cache.get(key);
    if (!cached) return null;

    if (Date.now() - cached.timestamp > this.config.maxAge) {
      this.cache.delete(key);
      return null;
    }

    return cached.value as T;
  }

  async set<T>(key: string, value: T): Promise<void> {
    this.cache.set(key, {
      value,
      timestamp: Date.now()
    });

    // Clean up old entries if cache size exceeds limit
    if (this.cache.size > this.config.maxSize) {
      const oldestKey = Array.from(this.cache.entries())
        .sort((a, b) => a[1].timestamp - b[1].timestamp)[0][0];
      this.cache.delete(oldestKey);
    }
  }

  async clear(): Promise<void> {
    this.cache.clear();
  }
}

// Network status hook
export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [networkType, setNetworkType] = useState<string | null>(null);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    const handleConnectionChange = () => {
      const connection = (navigator as any).connection;
      if (connection) {
        setNetworkType(connection.effectiveType);
      }
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    if ((navigator as any).connection) {
      (navigator as any).connection.addEventListener('change', handleConnectionChange);
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      if ((navigator as any).connection) {
        (navigator as any).connection.removeEventListener('change', handleConnectionChange);
      }
    };
  }, []);

  return { isOnline, networkType };
} 