import { openDB, DBSchema, IDBPDatabase } from 'idb';

interface FlousslyDB extends DBSchema {
  messages: {
    key: string;
    value: {
      id: string;
      chatId: string;
      content: string;
      timestamp: Date;
      type: 'TEXT' | 'VOICE' | 'SYSTEM' | 'FLOUSSDROP';
      status: 'SENT' | 'DELIVERED' | 'SEEN';
      voiceUrl?: string;
      floussdropData?: {
        amount: number;
        status: 'LOCKED' | 'UNLOCKING' | 'UNLOCKED' | 'EXPIRED';
        expiresAt: Date;
      };
    };
    indexes: {
      'by-chat': string;
      'by-timestamp': Date;
    };
  };
  floussdrops: {
    key: string;
    value: {
      id: string;
      amount: number;
      location: {
        latitude: number;
        longitude: number;
      };
      radius: number;
      status: 'LOCKED' | 'UNLOCKING' | 'UNLOCKED' | 'EXPIRED';
      createdAt: Date;
      expiresAt: Date;
      creatorId: string;
      claimerId?: string;
    };
    indexes: {
      'by-status': string;
      'by-expiry': Date;
    };
  };
  userData: {
    key: string;
    value: {
      id: string;
      publicKey: string;
      lastSync: Date;
      settings: {
        language: string;
        notifications: boolean;
        darkMode: boolean;
      };
    };
  };
}

class CacheService {
  private db: IDBPDatabase<FlousslyDB> | null = null;
  private static instance: CacheService;

  private constructor() {}

  static getInstance(): CacheService {
    if (!CacheService.instance) {
      CacheService.instance = new CacheService();
    }
    return CacheService.instance;
  }

  async initialize() {
    if (this.db) return;

    this.db = await openDB<FlousslyDB>('floussly-cache', 1, {
      upgrade(db) {
        // Messages store
        const messageStore = db.createObjectStore('messages', { keyPath: 'id' });
        messageStore.createIndex('by-chat', 'chatId');
        messageStore.createIndex('by-timestamp', 'timestamp');

        // FloussDrop store
        const floussdropStore = db.createObjectStore('floussdrops', { keyPath: 'id' });
        floussdropStore.createIndex('by-status', 'status');
        floussdropStore.createIndex('by-expiry', 'expiresAt');

        // User data store
        db.createObjectStore('userData', { keyPath: 'id' });
      },
    });
  }

  // Message operations
  async cacheMessage(message: FlousslyDB['messages']['value']) {
    if (!this.db) await this.initialize();
    await this.db!.put('messages', message);
  }

  async getMessage(messageId: string) {
    if (!this.db) await this.initialize();
    return this.db!.get('messages', messageId);
  }

  async getChatMessages(chatId: string) {
    if (!this.db) await this.initialize();
    const index = this.db!.transaction('messages').store.index('by-chat');
    return index.getAll(chatId);
  }

  async deleteMessage(messageId: string) {
    if (!this.db) await this.initialize();
    await this.db!.delete('messages', messageId);
  }

  // FloussDrop operations
  async cacheFloussDrop(floussdrop: FlousslyDB['floussdrops']['value']) {
    if (!this.db) await this.initialize();
    await this.db!.put('floussdrops', floussdrop);
  }

  async getFloussDrop(floussdropId: string) {
    if (!this.db) await this.initialize();
    return this.db!.get('floussdrops', floussdropId);
  }

  async getFloussDropsByStatus(status: string) {
    if (!this.db) await this.initialize();
    const index = this.db!.transaction('floussdrops').store.index('by-status');
    return index.getAll(status);
  }

  async getExpiredFloussDrops() {
    if (!this.db) await this.initialize();
    const now = new Date();
    const index = this.db!.transaction('floussdrops').store.index('by-expiry');
    return index.getAllKeys(IDBKeyRange.upperBound(now));
  }

  async markFloussDropAsExpired(floussdropId: string) {
    if (!this.db) await this.initialize();
    const floussdrop = await this.getFloussDrop(floussdropId);
    if (floussdrop) {
      floussdrop.status = 'EXPIRED';
      await this.cacheFloussDrop(floussdrop);
    }
  }

  async deleteFloussDrop(floussdropId: string) {
    if (!this.db) await this.initialize();
    await this.db!.delete('floussdrops', floussdropId);
  }

  // User data operations
  async cacheUserData(userData: FlousslyDB['userData']['value']) {
    if (!this.db) await this.initialize();
    await this.db!.put('userData', userData);
  }

  async getUserData(userId: string) {
    if (!this.db) await this.initialize();
    return this.db!.get('userData', userId);
  }

  async updateUserSettings(userId: string, settings: FlousslyDB['userData']['value']['settings']) {
    if (!this.db) await this.initialize();
    const userData = await this.getUserData(userId);
    if (userData) {
      userData.settings = settings;
      await this.cacheUserData(userData);
    }
  }

  // Cache cleanup
  async clearExpiredData() {
    if (!this.db) await this.initialize();
    const tx = this.db!.transaction(['messages', 'floussdrops'], 'readwrite');
    const now = new Date();

    // Clear expired floussdrops
    const floussdropIndex = tx.objectStore('floussdrops').index('by-expiry');
    const expiredFloussdrops = await floussdropIndex.getAllKeys(IDBKeyRange.upperBound(now));
    for (const key of expiredFloussdrops) {
      const floussdrop = await tx.objectStore('floussdrops').get(key);
      if (floussdrop) {
        floussdrop.status = 'EXPIRED';
        await tx.objectStore('floussdrops').put(floussdrop);
      }
    }

    // Clear old messages (older than 30 days)
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const messageIndex = tx.objectStore('messages').index('by-timestamp');
    const oldMessages = await messageIndex.getAllKeys(IDBKeyRange.upperBound(thirtyDaysAgo));
    for (const key of oldMessages) {
      await tx.objectStore('messages').delete(key);
    }

    await tx.done;
  }

  // Cache statistics
  async getCacheStats() {
    if (!this.db) await this.initialize();
    const tx = this.db!.transaction(['messages', 'floussdrops', 'userData'], 'readonly');
    
    const messageCount = await tx.objectStore('messages').count();
    const floussdropCount = await tx.objectStore('floussdrops').count();
    const userDataCount = await tx.objectStore('userData').count();

    return {
      messages: messageCount,
      floussdrops: floussdropCount,
      userData: userDataCount,
    };
  }
}

export const cacheService = CacheService.getInstance(); 