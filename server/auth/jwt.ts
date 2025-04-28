import jwt from 'jsonwebtoken';
import { config } from '../config';
import { RedisService } from '../redis/redis';

export interface JwtPayload {
  userId: string;
  email: string;
  role: string;
}

export class JwtService {
  private static instance: JwtService;
  private redisService: RedisService;

  private constructor() {
    this.redisService = RedisService.getInstance();
  }

  public static getInstance(): JwtService {
    if (!JwtService.instance) {
      JwtService.instance = new JwtService();
    }
    return JwtService.instance;
  }

  async generateTokens(payload: JwtPayload): Promise<{ accessToken: string; refreshToken: string }> {
    const accessToken = jwt.sign(payload, config.jwt.secret, {
      expiresIn: config.jwt.expiresIn
    });

    const refreshToken = jwt.sign(payload, config.jwt.secret, {
      expiresIn: config.jwt.refreshExpiresIn
    });

    // Store refresh token in Redis
    await this.redisService.set(
      `refresh_token:${payload.userId}`,
      refreshToken,
      parseInt(config.jwt.refreshExpiresIn)
    );

    return { accessToken, refreshToken };
  }

  async verifyAccessToken(token: string): Promise<JwtPayload> {
    try {
      const decoded = jwt.verify(token, config.jwt.secret) as JwtPayload;
      return decoded;
    } catch (error) {
      throw new Error('Invalid access token');
    }
  }

  async verifyRefreshToken(token: string): Promise<JwtPayload> {
    try {
      const decoded = jwt.verify(token, config.jwt.secret) as JwtPayload;
      
      // Verify token exists in Redis
      const storedToken = await this.redisService.get(`refresh_token:${decoded.userId}`);
      if (!storedToken || storedToken !== token) {
        throw new Error('Invalid refresh token');
      }

      return decoded;
    } catch (error) {
      throw new Error('Invalid refresh token');
    }
  }

  async revokeRefreshToken(userId: string): Promise<void> {
    await this.redisService.del(`refresh_token:${userId}`);
  }

  async rotateRefreshToken(oldToken: string): Promise<{ accessToken: string; refreshToken: string }> {
    const payload = await this.verifyRefreshToken(oldToken);
    await this.revokeRefreshToken(payload.userId);
    return this.generateTokens(payload);
  }
} 