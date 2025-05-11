import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { config } from '../config';
import logger from '../utils/logger';
import { prisma } from '../lib/prisma';
import { redis } from '../lib/redis';
import { AppError } from '../utils/errors';

export class AuthService {
  private static instance: AuthService;

  private constructor() {}

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
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
  async login(credentials: { email: string; password: string }) {
    try {
      const user = await prisma.user.findUnique({
        where: { email: credentials.email },
      });

      if (!user) {
        throw new AppError('Invalid credentials', 401);
      }

      const isValidPassword = await this.verifyPassword(credentials.password, user.password);
      if (!isValidPassword) {
        throw new AppError('Invalid credentials', 401);
      }

      const token = this.generateToken(user.id);
      await redis.set(`token:${token}`, user.id, 'EX', 3600); // 1 hour expiry

      return { token, user };
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
  async logout(token: string) {
    try {
      await redis.del(`token:${token}`);
    } catch (error) {
      logger.error('Failed to logout user:', error);
      throw error;
    }
  }

  // Refresh token
  async refreshToken(token: string) {
    try {
      const decoded = this.verifyToken(token);
      if (!decoded) {
        throw new AppError('Invalid token', 401);
      }

      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
      });

      if (!user) {
        throw new AppError('User not found', 404);
      }

      const newToken = this.generateToken(user.id);
      await redis.set(`token:${newToken}`, user.id, 'EX', 3600);

      return { newToken };
    } catch (error) {
      logger.error('Failed to refresh token:', error);
      throw error;
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
} 