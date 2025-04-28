import { Request, Response } from 'express';
import { UserService } from '../services/user';
import { AuthService } from '../services/auth';
import { validate } from '../middleware/validation';
import { userSchema } from '../validations/user';
import logger from '../utils/logger';
import multer from 'multer';

const upload = multer({
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  }
});

export class UserController {
  private userService: UserService;
  private authService: AuthService;

  constructor() {
    this.userService = UserService.getInstance();
    this.authService = new AuthService();
  }

  // Register a new user
  async register(req: Request, res: Response) {
    try {
      const { email, password, firstName, lastName } = req.body;
      const user = await this.userService.createUser({
        email,
        password,
        firstName,
        lastName,
      });

      const token = this.authService.generateToken(user.id);
      res.status(201).json({ user, token });
    } catch (error) {
      logger.error('User registration failed:', error);
      res.status(500).json({ error: 'Failed to register user' });
    }
  }

  // Login user
  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;
      const user = await this.userService.authenticateUser(email, password);

      if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const token = this.authService.generateToken(user.id);
      res.json({ user, token });
    } catch (error) {
      logger.error('User login failed:', error);
      res.status(500).json({ error: 'Failed to login' });
    }
  }

  // Logout user
  async logout(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      await this.userService.logoutUser(userId);
      res.json({ message: 'Logged out successfully' });
    } catch (error) {
      logger.error('User logout failed:', error);
      res.status(500).json({ error: 'Failed to logout' });
    }
  }

  // Get user profile
  async getProfile(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const user = await this.userService.getUserById(userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json({ user });
    } catch (error) {
      logger.error('Failed to get user profile:', error);
      res.status(500).json({ error: 'Failed to get profile' });
    }
  }

  // Update user profile
  async updateProfile(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const user = await this.userService.updateUser(userId, req.body);
      res.json({ user });
    } catch (error) {
      logger.error('Failed to update user profile:', error);
      res.status(500).json({ error: 'Failed to update profile' });
    }
  }

  // Change password
  async changePassword(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { currentPassword, newPassword } = req.body;
      await this.userService.changePassword(userId, currentPassword, newPassword);
      res.json({ message: 'Password changed successfully' });
    } catch (error) {
      logger.error('Failed to change password:', error);
      res.status(500).json({ error: 'Failed to change password' });
    }
  }

  // Request password reset
  async requestPasswordReset(req: Request, res: Response) {
    try {
      const { email } = req.body;
      await this.userService.requestPasswordReset(email);
      res.json({ message: 'Password reset email sent' });
    } catch (error) {
      logger.error('Failed to request password reset:', error);
      res.status(500).json({ error: 'Failed to request password reset' });
    }
  }

  // Reset password
  async resetPassword(req: Request, res: Response) {
    try {
      const { token, newPassword } = req.body;
      await this.userService.resetPassword(token, newPassword);
      res.json({ message: 'Password reset successfully' });
    } catch (error) {
      logger.error('Failed to reset password:', error);
      res.status(500).json({ error: 'Failed to reset password' });
    }
  }

  // Verify email
  async verifyEmail(req: Request, res: Response) {
    try {
      const { token } = req.params;
      await this.userService.verifyEmail(token);
      res.json({ message: 'Email verified successfully' });
    } catch (error) {
      logger.error('Failed to verify email:', error);
      res.status(500).json({ error: 'Failed to verify email' });
    }
  }

  // Upload KYC document
  async uploadKycDocument(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      if (!req.file) {
        return res.status(400).json({ error: 'No file provided' });
      }

      const documentKey = await this.userService.uploadKycDocument(
        userId,
        req.body.documentType,
        req.file.buffer
      );

      res.status(201).json({ documentKey });
    } catch (error) {
      logger.error('Failed to upload KYC document:', error);
      res.status(500).json({ error: 'Failed to upload document' });
    }
  }

  // Get KYC documents
  async getKycDocuments(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const profile = await this.userService.getUserProfile(userId);
      res.json({ documents: profile.kycDocuments });
    } catch (error) {
      logger.error('Failed to get KYC documents:', error);
      res.status(500).json({ error: 'Failed to get documents' });
    }
  }

  // Get KYC status
  async getKycStatus(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const profile = await this.userService.getUserProfile(userId);
      res.json({ status: profile.kycStatus });
    } catch (error) {
      logger.error('Failed to get KYC status:', error);
      res.status(500).json({ error: 'Failed to get KYC status' });
    }
  }
} 