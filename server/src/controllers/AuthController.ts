import { Request, Response } from 'express';
import { AuthService } from '../services/AuthService';
import { User } from '../models/User';
import { logger } from '../utils/logger';
import bcrypt from 'bcrypt';
import { redis } from '../utils/redis';
import { validateEmail, validatePassword, validatePhone } from '../utils/validators';

export class AuthController {
  private static instance: AuthController;
  private readonly authService: AuthService;
  private readonly SALT_ROUNDS = 12;

  private constructor() {
    this.authService = AuthService.getInstance();
  }

  public static getInstance(): AuthController {
    if (!AuthController.instance) {
      AuthController.instance = new AuthController();
    }
    return AuthController.instance;
  }

  async register(req: Request, res: Response): Promise<void> {
    try {
      const { email, password, phone, name } = req.body;

      // Input validation
      if (!validateEmail(email)) {
        res.status(400).json({ error: 'Invalid email format' });
        return;
      }

      if (!validatePassword(password)) {
        res.status(400).json({ 
          error: 'Password must be at least 8 characters long and contain uppercase, lowercase, number and special character' 
        });
        return;
      }

      if (!validatePhone(phone)) {
        res.status(400).json({ error: 'Invalid phone number format' });
        return;
      }

      // Check if user exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        res.status(400).json({ error: 'Email already registered' });
        return;
      }

      // Create user with secure password hashing
      const hashedPassword = await bcrypt.hash(password, this.SALT_ROUNDS);
      const user = await User.create({
        email,
        password: hashedPassword,
        phone,
        name,
        tier: 'STANDARD',
        mfaEnabled: false,
        lastLoginAttempt: new Date(),
        failedLoginAttempts: 0
      });

      // Generate token with proper expiration
      const token = this.authService.generateToken(user);

      // Set secure cookie
      res.cookie('auth_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
      });

      res.status(201).json({
        message: 'Registration successful',
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          tier: user.tier
        }
      });
    } catch (error) {
      logger.error('Registration error', { 
        error: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString()
      });
      res.status(500).json({ error: 'Registration failed' });
    }
  }

  async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;
      const result = await this.authService.login(email, password);

      if (!result.success) {
        res.status(401).json({ error: result.error });
        return;
      }

      if (result.requiresMFA) {
        res.json({
          requiresMFA: true,
          mfaType: result.mfaType
        });
        return;
      }

      res.json({
        token: result.token,
        user: {
          id: req.user.id,
          email: req.user.email,
          name: req.user.name,
          tier: req.user.tier
        }
      });
    } catch (error) {
      logger.error('Login error', { error: error.message });
      res.status(500).json({ error: 'Login failed' });
    }
  }

  async verifyMFA(req: Request, res: Response): Promise<void> {
    try {
      const { userId, code } = req.body;
      const result = await this.authService.verifyMFA(userId, code);

      if (!result.success) {
        res.status(401).json({ error: result.error });
        return;
      }

      // Mark MFA as verified
      await redis.setex(`mfa:verified:${userId}`, 3600, 'true'); // 1 hour

      res.json({
        token: result.token,
        user: {
          id: req.user.id,
          email: req.user.email,
          name: req.user.name,
          tier: req.user.tier
        }
      });
    } catch (error) {
      logger.error('MFA verification error', { error: error.message });
      res.status(500).json({ error: 'MFA verification failed' });
    }
  }

  async setupMFA(req: Request, res: Response): Promise<void> {
    try {
      const { type } = req.body;
      const userId = req.user.id;

      const result = await this.authService.setupMFA(userId, type);
      res.json(result);
    } catch (error) {
      logger.error('MFA setup error', { error: error.message });
      res.status(500).json({ error: 'MFA setup failed' });
    }
  }

  async verifyBiometric(req: Request, res: Response): Promise<void> {
    try {
      const { biometricData } = req.body;
      const userId = req.user.id;

      const result = await this.authService.verifyBiometric(userId, biometricData);
      if (!result.success) {
        res.status(401).json({ error: result.error });
        return;
      }

      // Mark biometric as verified
      await redis.setex(`biometric:verified:${userId}`, 3600, 'true'); // 1 hour

      res.json({
        token: result.token,
        user: {
          id: req.user.id,
          email: req.user.email,
          name: req.user.name,
          tier: req.user.tier
        }
      });
    } catch (error) {
      logger.error('Biometric verification error', { error: error.message });
      res.status(500).json({ error: 'Biometric verification failed' });
    }
  }

  async logout(req: Request, res: Response): Promise<void> {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      if (token) {
        // Blacklist token
        await redis.setex(`blacklist:${token}`, 86400, 'true'); // 24 hours
      }

      res.json({ message: 'Logged out successfully' });
    } catch (error) {
      logger.error('Logout error', { error: error.message });
      res.status(500).json({ error: 'Logout failed' });
    }
  }
} 