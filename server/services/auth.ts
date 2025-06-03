import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { config } from '../config';
import logger from '../utils/logger';
import { prisma } from '../lib/prisma';
import { redis } from '../lib/redis';
import { AppError } from '../utils/errors';
import { v4 as uuidv4 } from 'uuid';
import { createHash } from 'crypto';

export class AuthService {
  private static instance: AuthService;
  private readonly MAX_LOGIN_ATTEMPTS = 5;
  private readonly LOCKOUT_DURATION = 900; // 15 minutes
  private readonly TOKEN_ROTATION_INTERVAL = 3600; // 1 hour

  private constructor() {}

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  private generateDeviceFingerprint(req: any): string {
    const components = [
      req.headers['user-agent'],
      req.headers['accept-language'],
      req.ip,
      req.headers['sec-ch-ua-platform']
    ].filter(Boolean);
    
    return createHash('sha256')
      .update(components.join('|'))
      .digest('hex');
  }

  private async checkLoginAttempts(userId: string): Promise<void> {
    const attempts = await redis.get(`login_attempts:${userId}`);
    if (attempts && parseInt(attempts) >= this.MAX_LOGIN_ATTEMPTS) {
      throw new AppError('Account temporarily locked. Please try again later.', 429);
    }
  }

  private async incrementLoginAttempts(userId: string): Promise<void> {
    const attempts = await redis.incr(`login_attempts:${userId}`);
    if (attempts === 1) {
      await redis.expire(`login_attempts:${userId}`, this.LOCKOUT_DURATION);
    }
  }

  private async resetLoginAttempts(userId: string): Promise<void> {
    await redis.del(`login_attempts:${userId}`);
  }

  // Register new user
  async register(userData: { email: string; phone: string; password: string }) {
    try {
      const existingUser = await prisma.user.findFirst({
        where: {
          OR: [
            { email: userData.email },
            { phone: userData.phone }
          ]
        }
      });

      if (existingUser) {
        throw new AppError('User already exists', 400);
      }

      const hashedPassword = await this.hashPassword(userData.password);
      const user = await prisma.user.create({
        data: {
          ...userData,
          password: hashedPassword,
        },
      });

      return user;
    } catch (error) {
      logger.error('Failed to register user:', error);
      throw error;
    }
  }

  // Login user
  async login(credentials: { email: string; password: string }, req: any) {
    try {
      const user = await prisma.user.findUnique({
        where: { email: credentials.email },
      });

      if (!user) {
        throw new AppError('Invalid credentials', 401);
      }

      await this.checkLoginAttempts(user.id);

      const isValidPassword = await this.verifyPassword(credentials.password, user.password);
      if (!isValidPassword) {
        await this.incrementLoginAttempts(user.id);
        throw new AppError('Invalid credentials', 401);
      }

      await this.resetLoginAttempts(user.id);

      const deviceFingerprint = this.generateDeviceFingerprint(req);
      const sessionId = uuidv4();

      const { accessToken, refreshToken } = await this.generateTokens(user.id, sessionId, deviceFingerprint);

      // Store session information
      await redis.setex(
        `session:${sessionId}`,
        this.TOKEN_ROTATION_INTERVAL,
        JSON.stringify({
          userId: user.id,
          deviceFingerprint,
          lastActivity: Date.now()
        })
      );

      return { 
        accessToken, 
        refreshToken, 
        user: {
          id: user.id,
          email: user.email,
          role: user.role
        }
      };
    } catch (error) {
      logger.error('Failed to login user:', error);
      throw error;
    }
  }

  // Change password
  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new AppError('User not found', 404);
      }

      const isValidPassword = await this.verifyPassword(currentPassword, user.password);
      if (!isValidPassword) {
        throw new AppError('Invalid current password', 401);
      }

      const hashedPassword = await this.hashPassword(newPassword);
      await prisma.user.update({
        where: { id: userId },
        data: { password: hashedPassword },
      });
    } catch (error) {
      logger.error('Failed to change password:', error);
      throw error;
    }
  }

  // Logout user
  async logout(sessionId: string) {
    try {
      await redis.del(`refresh_token:${sessionId}`);
      await redis.del(`session:${sessionId}`);
    } catch (error) {
      logger.error('Failed to logout:', error);
      throw error;
    }
  }

  // Refresh token
  async refreshToken(refreshToken: string, req: any) {
    try {
      const decoded = jwt.verify(refreshToken, config.jwt.secret) as any;
      
      if (decoded.type !== 'refresh') {
        throw new AppError('Invalid token type', 401);
      }

      const deviceFingerprint = this.generateDeviceFingerprint(req);
      if (decoded.deviceFingerprint !== deviceFingerprint) {
        throw new AppError('Invalid device', 401);
      }

      const sessionData = await redis.get(`refresh_token:${decoded.sessionId}`);
      if (!sessionData) {
        throw new AppError('Session expired', 401);
      }

      const { token: storedToken } = JSON.parse(sessionData);
      if (storedToken !== refreshToken) {
        throw new AppError('Token has been revoked', 401);
      }

      // Generate new tokens
      const newSessionId = uuidv4();
      const tokens = await this.generateTokens(decoded.userId, newSessionId, deviceFingerprint);

      // Invalidate old session
      await redis.del(`refresh_token:${decoded.sessionId}`);
      await redis.del(`session:${decoded.sessionId}`);

      return tokens;
    } catch (error) {
      logger.error('Failed to refresh token:', error);
      throw new AppError('Invalid refresh token', 401);
    }
  }

  // Generate JWT token
  private generateToken(userId: string, expiresIn: string = config.jwt.expiresIn): string {
    try {
      return jwt.sign({ id: userId }, config.jwt.secret, { expiresIn });
    } catch (error) {
      logger.error('Failed to generate token:', error);
      throw error;
    }
  }

  // Verify JWT token
  private verifyToken(token: string): { id: string } | null {
    try {
      const decoded = jwt.verify(token, config.jwt.secret) as { id: string };
      return decoded;
    } catch (error) {
      logger.error('Failed to verify token:', error);
      return null;
    }
  }

  // Hash password
  private async hashPassword(password: string): Promise<string> {
    try {
      const salt = await bcrypt.genSalt(config.security.bcryptSaltRounds);
      return bcrypt.hash(password, salt);
    } catch (error) {
      logger.error('Failed to hash password:', error);
      throw error;
    }
  }

  // Verify password
  private async verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    try {
      return bcrypt.compare(password, hashedPassword);
    } catch (error) {
      logger.error('Failed to verify password:', error);
      throw error;
    }
  }

  // Generate refresh token
  generateRefreshToken(userId: string): string {
    try {
      return jwt.sign({ id: userId, type: 'refresh' }, config.jwt.secret, {
        expiresIn: '7d',
      });
    } catch (error) {
      logger.error('Failed to generate refresh token:', error);
      throw error;
    }
  }

  // Verify refresh token
  verifyRefreshToken(token: string): { id: string } | null {
    try {
      const decoded = jwt.verify(token, config.jwt.secret) as {
        id: string;
        type: string;
      };
      if (decoded.type !== 'refresh') {
        return null;
      }
      return { id: decoded.id };
    } catch (error) {
      logger.error('Failed to verify refresh token:', error);
      return null;
    }
  }

  // Generate password reset token
  generatePasswordResetToken(userId: string): string {
    try {
      return jwt.sign({ id: userId, type: 'reset' }, config.jwt.secret, {
        expiresIn: '1h',
      });
    } catch (error) {
      logger.error('Failed to generate password reset token:', error);
      throw error;
    }
  }

  // Verify password reset token
  verifyPasswordResetToken(token: string): { id: string } | null {
    try {
      const decoded = jwt.verify(token, config.jwt.secret) as {
        id: string;
        type: string;
      };
      if (decoded.type !== 'reset') {
        return null;
      }
      return { id: decoded.id };
    } catch (error) {
      logger.error('Failed to verify password reset token:', error);
      return null;
    }
  }

  // Generate email verification token
  generateEmailVerificationToken(userId: string): string {
    try {
      return jwt.sign({ id: userId, type: 'verify' }, config.jwt.secret, {
        expiresIn: '24h',
      });
    } catch (error) {
      logger.error('Failed to generate email verification token:', error);
      throw error;
    }
  }

  // Verify email verification token
  verifyEmailVerificationToken(token: string): { id: string } | null {
    try {
      const decoded = jwt.verify(token, config.jwt.secret) as {
        id: string;
        type: string;
      };
      if (decoded.type !== 'verify') {
        return null;
      }
      return { id: decoded.id };
    } catch (error) {
      logger.error('Failed to verify email verification token:', error);
      return null;
    }
  }

  private async generateTokens(userId: string, sessionId: string, deviceFingerprint: string) {
    const accessToken = jwt.sign(
      { 
        userId,
        sessionId,
        deviceFingerprint,
        type: 'access'
      },
      config.jwt.secret,
      { expiresIn: '15m' }
    );

    const refreshToken = jwt.sign(
      { 
        userId,
        sessionId,
        deviceFingerprint,
        type: 'refresh'
      },
      config.jwt.secret,
      { expiresIn: '7d' }
    );

    // Store refresh token with session info
    await redis.setex(
      `refresh_token:${sessionId}`,
      7 * 24 * 60 * 60, // 7 days
      JSON.stringify({
        token: refreshToken,
        deviceFingerprint,
        createdAt: Date.now()
      })
    );

    return { accessToken, refreshToken };
  }

  async validateToken(token: string, req: any): Promise<boolean> {
    try {
      const decoded = jwt.verify(token, config.jwt.secret) as any;
      
      if (decoded.type !== 'access') {
        return false;
      }

      const deviceFingerprint = this.generateDeviceFingerprint(req);
      if (decoded.deviceFingerprint !== deviceFingerprint) {
        return false;
      }

      const sessionData = await redis.get(`session:${decoded.sessionId}`);
      if (!sessionData) {
        return false;
      }

      // Update last activity
      await redis.setex(
        `session:${decoded.sessionId}`,
        this.TOKEN_ROTATION_INTERVAL,
        JSON.stringify({
          ...JSON.parse(sessionData),
          lastActivity: Date.now()
        })
      );

      return true;
    } catch (error) {
      return false;
    }
  }
} 