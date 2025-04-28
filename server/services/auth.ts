import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { config } from '../config';
import logger from '../utils/logger';

export class AuthService {
  private static instance: AuthService;

  private constructor() {}

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  // Generate JWT token
  generateToken(userId: string, expiresIn: string = config.jwt.expiresIn): string {
    try {
      return jwt.sign({ id: userId }, config.jwt.secret, { expiresIn });
    } catch (error) {
      logger.error('Failed to generate token:', error);
      throw error;
    }
  }

  // Verify JWT token
  verifyToken(token: string): { id: string } | null {
    try {
      const decoded = jwt.verify(token, config.jwt.secret) as { id: string };
      return decoded;
    } catch (error) {
      logger.error('Failed to verify token:', error);
      return null;
    }
  }

  // Hash password
  async hashPassword(password: string): Promise<string> {
    try {
      const salt = await bcrypt.genSalt(config.security.bcryptSaltRounds);
      return bcrypt.hash(password, salt);
    } catch (error) {
      logger.error('Failed to hash password:', error);
      throw error;
    }
  }

  // Verify password
  async verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
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