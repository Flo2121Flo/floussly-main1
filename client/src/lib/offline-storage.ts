import { SECURITY_CONFIG } from "../config/security";
import { SecureStorage } from "./security";

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
  signature: string;
}

interface CacheConfig {
  maxSize: number;
  maxAge: number;
  encryptionKey: string;
}

const DEFAULT_CONFIG: CacheConfig = {
  maxSize: 10 * 1024 * 1024, // 10MB
  maxAge: 24 * 60 * 60 * 1000, // 24 hours
  encryptionKey: process.env.NEXT_PUBLIC_CACHE_KEY || "default-key",
};

export class OfflineStorage {
  private static instance: OfflineStorage;
  private config: CacheConfig;
  private cache: Map<string, CacheEntry<any>>;
  private currentSize: number;

  private constructor(config: Partial<CacheConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.cache = new Map();
    this.currentSize = 0;
    this.initialize();
  }

  public static getInstance(config?: Partial<CacheConfig>): OfflineStorage {
    if (!OfflineStorage.instance) {
      OfflineStorage.instance = new OfflineStorage(config);
    }
    return OfflineStorage.instance;
  }

  private initialize(): void {
    // Load existing cache from secure storage
    const savedCache = SecureStorage.get("offline_cache");
    if (savedCache) {
      try {
        const parsedCache = JSON.parse(savedCache);
        this.cache = new Map(Object.entries(parsedCache));
        this.currentSize = this.calculateCacheSize();
      } catch (error) {
        console.error("Failed to load offline cache:", error);
        this.clear();
      }
    }

    // Set up periodic cleanup
    setInterval(() => this.cleanup(), 60 * 60 * 1000); // Cleanup every hour
  }

  private calculateCacheSize(): number {
    return Array.from(this.cache.entries()).reduce((size, [key, value]) => {
      return size + key.length + JSON.stringify(value).length;
    }, 0);
  }

  private generateSignature(data: any, timestamp: number): string {
    // In a real application, use a proper cryptographic signature
    // This is a placeholder implementation
    const stringToSign = JSON.stringify(data) + timestamp + this.config.encryptionKey;
    return btoa(stringToSign);
  }

  private verifySignature(entry: CacheEntry<any>): boolean {
    const expectedSignature = this.generateSignature(entry.data, entry.timestamp);
    return entry.signature === expectedSignature;
  }

  private encrypt(data: any): string {
    // In a real application, use a proper encryption library
    // This is a placeholder implementation
    return btoa(JSON.stringify(data));
  }

  private decrypt(encryptedData: string): any {
    // In a real application, use a proper decryption library
    // This is a placeholder implementation
    return JSON.parse(atob(encryptedData));
  }

  private cleanup(): void {
    const now = Date.now();
    let newSize = 0;

    // Remove expired entries and calculate new size
    for (const [key, entry] of this.cache.entries()) {
      if (entry.expiresAt < now || !this.verifySignature(entry)) {
        this.cache.delete(key);
      } else {
        newSize += key.length + JSON.stringify(entry).length;
      }
    }

    this.currentSize = newSize;

    // If still over size limit, remove oldest entries
    if (this.currentSize > this.config.maxSize) {
      const sortedEntries = Array.from(this.cache.entries())
        .sort(([, a], [, b]) => a.timestamp - b.timestamp);

      for (const [key, entry] of sortedEntries) {
        this.cache.delete(key);
        newSize -= key.length + JSON.stringify(entry).length;
        if (newSize <= this.config.maxSize) break;
      }

      this.currentSize = newSize;
    }

    // Save updated cache
    this.persistCache();
  }

  private persistCache(): void {
    const cacheObject = Object.fromEntries(this.cache);
    SecureStorage.set("offline_cache", JSON.stringify(cacheObject));
  }

  public set<T>(key: string, data: T, maxAge: number = this.config.maxAge): void {
    if (!SECURITY_CONFIG.audit.enabled) return;

    const timestamp = Date.now();
    const expiresAt = timestamp + maxAge;
    const signature = this.generateSignature(data, timestamp);

    const entry: CacheEntry<T> = {
      data: this.encrypt(data),
      timestamp,
      expiresAt,
      signature,
    };

    const entrySize = key.length + JSON.stringify(entry).length;

    // Check if adding this entry would exceed the size limit
    if (this.currentSize + entrySize > this.config.maxSize) {
      this.cleanup();
      // If still over limit after cleanup, remove oldest entry
      if (this.currentSize + entrySize > this.config.maxSize) {
        const oldestKey = Array.from(this.cache.keys())
          .sort((a, b) => this.cache.get(a)!.timestamp - this.cache.get(b)!.timestamp)[0];
        this.cache.delete(oldestKey);
      }
    }

    this.cache.set(key, entry);
    this.currentSize += entrySize;
    this.persistCache();
  }

  public get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    const now = Date.now();
    if (entry.expiresAt < now || !this.verifySignature(entry)) {
      this.cache.delete(key);
      this.persistCache();
      return null;
    }

    try {
      return this.decrypt(entry.data);
    } catch (error) {
      console.error("Failed to decrypt cached data:", error);
      this.cache.delete(key);
      this.persistCache();
      return null;
    }
  }

  public delete(key: string): void {
    const entry = this.cache.get(key);
    if (entry) {
      this.currentSize -= key.length + JSON.stringify(entry).length;
      this.cache.delete(key);
      this.persistCache();
    }
  }

  public clear(): void {
    this.cache.clear();
    this.currentSize = 0;
    SecureStorage.remove("offline_cache");
  }

  public getSize(): number {
    return this.currentSize;
  }

  public getEntryCount(): number {
    return this.cache.size;
  }
}

// Usage example:
// const offlineStorage = OfflineStorage.getInstance();
// offlineStorage.set('userData', { name: 'John' });
// const userData = offlineStorage.get('userData'); 