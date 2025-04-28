import { CognitoService } from '../aws/cognito';
import { JwtService } from '../auth/jwt';
import { RedisService } from '../redis/redis';
import { S3Service } from '../aws/s3';
import { DatabaseService } from './database';
import { AuthService } from './auth';
import { EmailService } from './email';
import { logger } from '../utils/logger';

export interface UserProfile {
  userId: string;
  email: string;
  name: string;
  phoneNumber: string;
  role: string;
  kycStatus: 'pending' | 'approved' | 'rejected';
  kycDocuments: string[];
  createdAt: Date;
  updatedAt: Date;
}

export class UserService {
  private static instance: UserService;
  private cognitoService: CognitoService;
  private jwtService: JwtService;
  private redisService: RedisService;
  private s3Service: S3Service;
  private db: DatabaseService;
  private authService: AuthService;
  private emailService: EmailService;

  private constructor() {
    this.cognitoService = CognitoService.getInstance();
    this.jwtService = JwtService.getInstance();
    this.redisService = RedisService.getInstance();
    this.s3Service = S3Service.getInstance();
    this.db = new DatabaseService();
    this.authService = new AuthService();
    this.emailService = new EmailService();
  }

  public static getInstance(): UserService {
    if (!UserService.instance) {
      UserService.instance = new UserService();
    }
    return UserService.instance;
  }

  async registerUser(email: string, password: string, name: string, phoneNumber: string): Promise<{ userId: string; tokens: { accessToken: string; refreshToken: string } }> {
    // Create user in Cognito
    const userId = await this.cognitoService.createUser(email, password, {
      email,
      name,
      phone_number: phoneNumber,
      email_verified: 'true'
    });

    // Set user password
    await this.cognitoService.setUserPassword(userId, password);

    // Create user profile in Redis
    const userProfile: UserProfile = {
      userId,
      email,
      name,
      phoneNumber,
      role: 'user',
      kycStatus: 'pending',
      kycDocuments: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    await this.redisService.setHash('user_profiles', userId, JSON.stringify(userProfile));

    // Generate tokens
    const tokens = await this.jwtService.generateTokens({
      userId,
      email,
      role: 'user'
    });

    return { userId, tokens };
  }

  async loginUser(email: string, password: string): Promise<{ userId: string; tokens: { accessToken: string; refreshToken: string } }> {
    // Authenticate user
    const { accessToken, refreshToken, idToken } = await this.cognitoService.authenticateUser(email, password);

    // Get user profile
    const userAttributes = await this.cognitoService.getUser(email);
    const userId = userAttributes.sub || '';

    // Generate tokens
    const tokens = await this.jwtService.generateTokens({
      userId,
      email,
      role: userAttributes['custom:role'] || 'user'
    });

    return { userId, tokens };
  }

  async getUserProfile(userId: string): Promise<UserProfile> {
    const userProfile = await this.redisService.getHash('user_profiles', userId);
    if (!userProfile) {
      throw new Error('User profile not found');
    }
    return JSON.parse(userProfile);
  }

  async updateUserProfile(userId: string, updates: Partial<UserProfile>): Promise<UserProfile> {
    const currentProfile = await this.getUserProfile(userId);
    const updatedProfile = {
      ...currentProfile,
      ...updates,
      updatedAt: new Date()
    };

    await this.redisService.setHash('user_profiles', userId, JSON.stringify(updatedProfile));
    return updatedProfile;
  }

  async uploadKycDocument(userId: string, documentType: string, fileBuffer: Buffer): Promise<string> {
    const documentKey = await this.s3Service.uploadKycDocument(userId, documentType, fileBuffer);
    
    const profile = await this.getUserProfile(userId);
    profile.kycDocuments.push(documentKey);
    await this.updateUserProfile(userId, profile);

    return documentKey;
  }

  async getKycDocument(userId: string, documentKey: string): Promise<Buffer> {
    const profile = await this.getUserProfile(userId);
    if (!profile.kycDocuments.includes(documentKey)) {
      throw new Error('Document not found');
    }
    return this.s3Service.getKycDocument(documentKey);
  }

  async deleteKycDocument(userId: string, documentKey: string): Promise<void> {
    const profile = await this.getUserProfile(userId);
    if (!profile.kycDocuments.includes(documentKey)) {
      throw new Error('Document not found');
    }

    await this.s3Service.deleteKycDocument(documentKey);
    profile.kycDocuments = profile.kycDocuments.filter(doc => doc !== documentKey);
    await this.updateUserProfile(userId, profile);
  }

  async updateKycStatus(userId: string, status: 'pending' | 'approved' | 'rejected'): Promise<UserProfile> {
    return this.updateUserProfile(userId, { kycStatus: status });
  }

  async logoutUser(userId: string): Promise<void> {
    await this.jwtService.revokeRefreshToken(userId);
  }

  // Create a new user
  async createUser(data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }) {
    try {
      const hashedPassword = await this.authService.hashPassword(data.password);
      const user = await this.db.query(
        'INSERT INTO users (email, password, first_name, last_name) VALUES ($1, $2, $3, $4) RETURNING *',
        [data.email, hashedPassword, data.firstName, data.lastName]
      );

      // Send verification email
      const token = this.authService.generateToken(user.id, '1d');
      await this.emailService.sendVerificationEmail(user.email, token);

      return user;
    } catch (error) {
      logger.error('Failed to create user:', error);
      throw error;
    }
  }

  // Authenticate user
  async authenticateUser(email: string, password: string) {
    try {
      const user = await this.db.query('SELECT * FROM users WHERE email = $1', [email]);
      if (!user) {
        return null;
      }

      const isValid = await this.authService.verifyPassword(password, user.password);
      if (!isValid) {
        return null;
      }

      return user;
    } catch (error) {
      logger.error('Failed to authenticate user:', error);
      throw error;
    }
  }

  // Get user by ID
  async getUserById(id: string) {
    try {
      const user = await this.db.query('SELECT * FROM users WHERE id = $1', [id]);
      return user;
    } catch (error) {
      logger.error('Failed to get user:', error);
      throw error;
    }
  }

  // Update user
  async updateUser(id: string, data: Partial<{
    email: string;
    firstName: string;
    lastName: string;
  }>) {
    try {
      const updates = Object.entries(data)
        .filter(([_, value]) => value !== undefined)
        .map(([key, value], index) => `${key} = $${index + 2}`)
        .join(', ');

      const values = [id, ...Object.values(data).filter(value => value !== undefined)];
      const query = `UPDATE users SET ${updates} WHERE id = $1 RETURNING *`;

      const user = await this.db.query(query, values);
      return user;
    } catch (error) {
      logger.error('Failed to update user:', error);
      throw error;
    }
  }

  // Change password
  async changePassword(id: string, currentPassword: string, newPassword: string) {
    try {
      const user = await this.getUserById(id);
      if (!user) {
        throw new Error('User not found');
      }

      const isValid = await this.authService.verifyPassword(currentPassword, user.password);
      if (!isValid) {
        throw new Error('Invalid current password');
      }

      const hashedPassword = await this.authService.hashPassword(newPassword);
      await this.db.query('UPDATE users SET password = $1 WHERE id = $2', [hashedPassword, id]);
    } catch (error) {
      logger.error('Failed to change password:', error);
      throw error;
    }
  }

  // Request password reset
  async requestPasswordReset(email: string) {
    try {
      const user = await this.db.query('SELECT * FROM users WHERE email = $1', [email]);
      if (!user) {
        return; // Don't reveal if user exists
      }

      const token = this.authService.generateToken(user.id, '1h');
      await this.emailService.sendPasswordResetEmail(user.email, token);
    } catch (error) {
      logger.error('Failed to request password reset:', error);
      throw error;
    }
  }

  // Reset password
  async resetPassword(token: string, newPassword: string) {
    try {
      const decoded = this.authService.verifyToken(token);
      if (!decoded) {
        throw new Error('Invalid token');
      }

      const hashedPassword = await this.authService.hashPassword(newPassword);
      await this.db.query('UPDATE users SET password = $1 WHERE id = $2', [hashedPassword, decoded.id]);
    } catch (error) {
      logger.error('Failed to reset password:', error);
      throw error;
    }
  }

  // Verify email
  async verifyEmail(token: string) {
    try {
      const decoded = this.authService.verifyToken(token);
      if (!decoded) {
        throw new Error('Invalid token');
      }

      await this.db.query('UPDATE users SET email_verified = true WHERE id = $1', [decoded.id]);
    } catch (error) {
      logger.error('Failed to verify email:', error);
      throw error;
    }
  }
} 