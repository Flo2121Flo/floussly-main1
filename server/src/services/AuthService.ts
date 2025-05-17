import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { User } from '../models/User';
import { redis } from '../utils/redis';
import { logger } from '../utils/logger';
import { sendEmail } from '../utils/email';
import { generateMFACode } from '../utils/mfa';
import { validateBiometricData } from '../utils/biometric';
import { rateLimiters } from '../utils/rateLimiter';
import { validatePassword, validateEmail, validatePhoneNumber } from '../utils/validators';
import { hashSensitiveData, verifyHashedData, generateSecureToken } from '../utils/encryption';
import { NotificationService } from './NotificationService';
import { v4 as uuidv4 } from 'uuid';

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

interface BiometricData {
  userId: string;
  deviceId: string;
  publicKey: string;
  signature: string;
}

export class AuthService {
  private static instance: AuthService;
  private readonly JWT_SECRET: string;
  private readonly JWT_REFRESH_SECRET: string;
  private readonly notificationService: NotificationService;
  private readonly JWT_EXPIRATION: string;
  private readonly MFA_EXPIRATION: number;
  private readonly MAX_LOGIN_ATTEMPTS: number;
  private readonly LOCKOUT_DURATION: number;

  private constructor() {
    this.JWT_SECRET = process.env.JWT_SECRET!;
    this.JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET!;
    this.notificationService = NotificationService.getInstance();
    this.JWT_EXPIRATION = '24h';
    this.MFA_EXPIRATION = 300; // 5 minutes
    this.MAX_LOGIN_ATTEMPTS = 5;
    this.LOCKOUT_DURATION = 900; // 15 minutes

    if (!this.JWT_SECRET || !this.JWT_REFRESH_SECRET) {
      throw new Error('JWT secrets are required');
    }
  }

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  async register(userData: {
    email: string;
    password: string;
    phone: string;
    name: string;
    language: string;
  }): Promise<{ user: any; tokens: AuthTokens }> {
    try {
      // Validate input
      if (!validateEmail(userData.email)) {
        throw new Error('Invalid email format');
      }
      if (!validatePhoneNumber(userData.phone)) {
        throw new Error('Invalid phone number format');
      }
      if (!validatePassword(userData.password)) {
        throw new Error('Password does not meet security requirements');
      }

      // Check if user exists
      const existingUser = await User.findOne({
        $or: [{ email: userData.email }, { phone: userData.phone }]
      });

      if (existingUser) {
        throw new Error('User already exists');
      }

      // Hash password
      const hashedPassword = await hashSensitiveData(userData.password);

      // Create user
      const user = await User.create({
        ...userData,
        password: hashedPassword,
        status: 'PENDING',
        kycStatus: 'NOT_STARTED',
        tier: 'STANDARD',
        failedLoginAttempts: 0,
        lastLogin: null,
        deviceTokens: []
      });

      // Generate tokens
      const tokens = await this.generateTokens(user);

      // Send welcome email
      await this.notificationService.sendNotification({
        userId: user.id,
        type: 'SYSTEM',
        title: 'Welcome to Floussly',
        message: 'Your account has been created successfully',
        channels: ['EMAIL']
      });

      return { user, tokens };
    } catch (error) {
      logger.error('Registration failed', {
        error: error.message,
        email: userData.email,
        timestamp: new Date().toISOString()
      });
      throw error;
    }
  }

  async login(credentials: {
    email: string;
    password: string;
    deviceId: string;
    deviceInfo: any;
  }): Promise<{ user: any; tokens: AuthTokens }> {
    try {
      // Rate limiting
      const canProceed = await rateLimiters.auth.consume(credentials.email);
      if (!canProceed) {
        throw new Error('Too many login attempts. Please try again later.');
      }

      // Find user
      const user = await User.findOne({ email: credentials.email });
      if (!user) {
        throw new Error('Invalid credentials');
      }

      // Check if account is locked
      if (user.isLocked) {
        throw new Error('Account is locked. Please contact support.');
      }

      // Verify password
      const isValid = await verifyHashedData(credentials.password, user.password);
      if (!isValid) {
        // Increment failed attempts
        user.failedLoginAttempts += 1;
        if (user.failedLoginAttempts >= 5) {
          user.isLocked = true;
          await this.notificationService.sendNotification({
            userId: user.id,
            type: 'SECURITY',
            title: 'Account Locked',
            message: 'Your account has been locked due to multiple failed login attempts',
            channels: ['EMAIL']
          });
        }
        await user.save();
        throw new Error('Invalid credentials');
      }

      // Reset failed attempts
      user.failedLoginAttempts = 0;
      user.lastLogin = new Date();
      await user.save();

      // Generate tokens
      const tokens = await this.generateTokens(user);

      // Log successful login
      logger.info('User logged in', {
        userId: user.id,
        deviceId: credentials.deviceId,
        timestamp: new Date().toISOString()
      });

      return { user, tokens };
    } catch (error) {
      logger.error('Login failed', {
        error: error.message,
        email: credentials.email,
        timestamp: new Date().toISOString()
      });
      throw error;
    }
  }

  async setupBiometric(userId: string, biometricData: BiometricData): Promise<void> {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Store biometric data securely
      const key = `biometric:${userId}:${biometricData.deviceId}`;
      await redis.setex(key, 30 * 24 * 60 * 60, JSON.stringify(biometricData)); // 30 days

      // Update user's device tokens
      if (!user.deviceTokens.includes(biometricData.deviceId)) {
        user.deviceTokens.push(biometricData.deviceId);
        await user.save();
      }

      logger.info('Biometric setup completed', {
        userId,
        deviceId: biometricData.deviceId,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.error('Biometric setup failed', {
        error: error.message,
        userId,
        timestamp: new Date().toISOString()
      });
      throw error;
    }
  }

  async verifyBiometric(userId: string, deviceId: string, signature: string): Promise<boolean> {
    try {
      const key = `biometric:${userId}:${deviceId}`;
      const storedData = await redis.get(key);

      if (!storedData) {
        throw new Error('Biometric data not found');
      }

      const biometricData: BiometricData = JSON.parse(storedData);
      // Verify signature (implement actual verification logic)
      const isValid = true; // Placeholder

      if (isValid) {
        logger.info('Biometric verification successful', {
          userId,
          deviceId,
          timestamp: new Date().toISOString()
        });
      }

      return isValid;
    } catch (error) {
      logger.error('Biometric verification failed', {
        error: error.message,
        userId,
        deviceId,
        timestamp: new Date().toISOString()
      });
      return false;
    }
  }

  async setupMFA(userId: string): Promise<{ secret: string; qrCode: string }> {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Generate MFA secret
      const secret = generateSecureToken(20);
      const qrCode = `otpauth://totp/Floussly:${user.email}?secret=${secret}&issuer=Floussly`;

      // Store secret temporarily
      const key = `mfa:${userId}:setup`;
      await redis.setex(key, 300, secret); // 5 minutes

      return { secret, qrCode };
    } catch (error) {
      logger.error('MFA setup failed', {
        error: error.message,
        userId,
        timestamp: new Date().toISOString()
      });
      throw error;
    }
  }

  async verifyMFA(userId: string, code: string): Promise<boolean> {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Verify MFA code (implement actual verification logic)
      const isValid = true; // Placeholder

      if (isValid) {
        user.mfaEnabled = true;
        await user.save();

        logger.info('MFA verification successful', {
          userId,
          timestamp: new Date().toISOString()
        });
      }

      return isValid;
    } catch (error) {
      logger.error('MFA verification failed', {
        error: error.message,
        userId,
        timestamp: new Date().toISOString()
      });
      return false;
    }
  }

  private async generateTokens(user: any): Promise<AuthTokens> {
    const accessToken = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        tier: user.tier
      },
      this.JWT_SECRET,
      { expiresIn: '15m' }
    );

    const refreshToken = jwt.sign(
      {
        userId: user.id,
        tokenId: uuidv4()
      },
      this.JWT_REFRESH_SECRET,
      { expiresIn: '7d' }
    );

    // Store refresh token
    const key = `refresh:${user.id}:${refreshToken}`;
    await redis.setex(key, 7 * 24 * 60 * 60, '1'); // 7 days

    return {
      accessToken,
      refreshToken,
      expiresIn: 15 * 60 // 15 minutes in seconds
    };
  }

  async refreshToken(refreshToken: string): Promise<AuthTokens> {
    try {
      const decoded = jwt.verify(refreshToken, this.JWT_REFRESH_SECRET) as any;
      const key = `refresh:${decoded.userId}:${refreshToken}`;

      // Check if refresh token exists
      const exists = await redis.get(key);
      if (!exists) {
        throw new Error('Invalid refresh token');
      }

      const user = await User.findById(decoded.userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Generate new tokens
      const tokens = await this.generateTokens(user);

      // Invalidate old refresh token
      await redis.del(key);

      return tokens;
    } catch (error) {
      logger.error('Token refresh failed', {
        error: error.message,
        timestamp: new Date().toISOString()
      });
      throw error;
    }
  }

  async logout(userId: string, refreshToken: string): Promise<void> {
    try {
      // Invalidate refresh token
      const key = `refresh:${userId}:${refreshToken}`;
      await redis.del(key);

      // Clear user sessions
      const sessionKey = `session:${userId}:*`;
      const sessions = await redis.keys(sessionKey);
      if (sessions.length > 0) {
        await redis.del(sessions);
      }

      logger.info('User logged out', {
        userId,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.error('Logout failed', {
        error: error.message,
        userId,
        timestamp: new Date().toISOString()
      });
      throw error;
    }
  }
} 