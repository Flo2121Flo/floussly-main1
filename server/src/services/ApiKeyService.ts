import { pg } from '../db/pg';
import { redis } from '../db/redis';
import { logger } from '../utils/logger';
import { v4 as uuidv4 } from 'uuid';
import { createHash } from 'crypto';

interface ApiKey {
  id: string;
  userId: string;
  name: string;
  key: string;
  expiresAt: Date;
  lastUsedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export class ApiKeyService {
  private static readonly KEY_PREFIX = 'api-key:';
  private static readonly EXPIRY_DAYS = 90; // Keys expire after 90 days
  private static readonly ROTATION_DAYS = 30; // Rotate keys every 30 days

  static async createKey(userId: string, name: string): Promise<ApiKey> {
    const key = uuidv4();
    const hashedKey = this.hashKey(key);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + this.EXPIRY_DAYS);

    const result = await pg.query(
      `INSERT INTO api_keys (user_id, name, key, expires_at)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [userId, name, hashedKey, expiresAt]
    );

    const apiKey = result.rows[0];
    await this.cacheKey(apiKey);
    
    return {
      ...apiKey,
      key // Return the unhashed key only once
    };
  }

  static async validateKey(key: string): Promise<ApiKey | null> {
    const hashedKey = this.hashKey(key);
    const cachedKey = await this.getCachedKey(hashedKey);
    
    if (cachedKey) {
      if (this.isKeyExpired(cachedKey)) {
        await this.revokeKey(cachedKey.id);
        return null;
      }
      return cachedKey;
    }

    const result = await pg.query(
      `SELECT * FROM api_keys WHERE key = $1`,
      [hashedKey]
    );

    if (result.rows.length === 0) {
      return null;
    }

    const apiKey = result.rows[0];
    await this.cacheKey(apiKey);
    
    if (this.isKeyExpired(apiKey)) {
      await this.revokeKey(apiKey.id);
      return null;
    }

    return apiKey;
  }

  static async rotateKey(keyId: string): Promise<ApiKey> {
    const result = await pg.query(
      `SELECT * FROM api_keys WHERE id = $1`,
      [keyId]
    );

    if (result.rows.length === 0) {
      throw new Error('API key not found');
    }

    const oldKey = result.rows[0];
    const newKey = await this.createKey(oldKey.user_id, oldKey.name);
    
    // Keep old key valid for 24 hours to allow for transition
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    await pg.query(
      `UPDATE api_keys SET expires_at = $1 WHERE id = $2`,
      [expiresAt, keyId]
    );

    await this.cacheKey(oldKey);
    return newKey;
  }

  static async revokeKey(keyId: string): Promise<void> {
    await pg.query(
      `UPDATE api_keys SET expires_at = NOW() WHERE id = $1`,
      [keyId]
    );
    await redis.del(`${this.KEY_PREFIX}${keyId}`);
  }

  static async listKeys(userId: string): Promise<ApiKey[]> {
    const result = await pg.query(
      `SELECT * FROM api_keys WHERE user_id = $1 ORDER BY created_at DESC`,
      [userId]
    );
    return result.rows;
  }

  private static hashKey(key: string): string {
    return createHash('sha256').update(key).digest('hex');
  }

  private static async cacheKey(key: ApiKey): Promise<void> {
    await redis.set(
      `${this.KEY_PREFIX}${key.key}`,
      JSON.stringify(key),
      'EX',
      Math.floor((key.expiresAt.getTime() - Date.now()) / 1000)
    );
  }

  private static async getCachedKey(hashedKey: string): Promise<ApiKey | null> {
    const cached = await redis.get(`${this.KEY_PREFIX}${hashedKey}`);
    return cached ? JSON.parse(cached) : null;
  }

  private static isKeyExpired(key: ApiKey): boolean {
    return new Date(key.expiresAt) < new Date();
  }

  static async checkAndRotateKeys(): Promise<void> {
    const result = await pg.query(
      `SELECT * FROM api_keys 
       WHERE expires_at > NOW() 
       AND last_used_at < NOW() - INTERVAL '${this.ROTATION_DAYS} days'`
    );

    for (const key of result.rows) {
      try {
        await this.rotateKey(key.id);
        logger.info(`Rotated API key ${key.id} for user ${key.user_id}`);
      } catch (error) {
        logger.error(`Failed to rotate API key ${key.id}:`, error);
      }
    }
  }
} 