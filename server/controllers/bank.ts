import { Request, Response } from 'express';
import { BankService } from '../services/bank';
import { validateRequest } from '../middleware/validate';
import { bankSchema } from '../validations/bank';
import { logger } from '../utils/logger';

export class BankController {
  private bankService: BankService;

  constructor() {
    this.bankService = new BankService();
  }

  // Link a new bank account
  async linkAccount(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { error } = validateRequest(req.body, bankSchema.linkAccount);
      if (error) {
        return res.status(400).json({ error: error.details[0].message });
      }

      const bankAccount = await this.bankService.linkAccount(userId, req.body);
      res.status(201).json({ bankAccount });
    } catch (error) {
      logger.error('Failed to link bank account:', error);
      res.status(500).json({ error: 'Failed to link bank account' });
    }
  }

  // Get all bank accounts for a user
  async getAccounts(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const accounts = await this.bankService.getUserAccounts(userId);
      res.json({ accounts });
    } catch (error) {
      logger.error('Failed to get bank accounts:', error);
      res.status(500).json({ error: 'Failed to get bank accounts' });
    }
  }

  // Get a specific bank account
  async getAccount(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { accountId } = req.params;
      const account = await this.bankService.getAccountById(userId, accountId);
      
      if (!account) {
        return res.status(404).json({ error: 'Bank account not found' });
      }

      res.json({ account });
    } catch (error) {
      logger.error('Failed to get bank account:', error);
      res.status(500).json({ error: 'Failed to get bank account' });
    }
  }

  // Update bank account
  async updateAccount(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { accountId } = req.params;
      const { error } = validateRequest(req.body, bankSchema.updateAccount);
      if (error) {
        return res.status(400).json({ error: error.details[0].message });
      }

      const account = await this.bankService.updateAccount(userId, accountId, req.body);
      res.json({ account });
    } catch (error) {
      logger.error('Failed to update bank account:', error);
      res.status(500).json({ error: 'Failed to update bank account' });
    }
  }

  // Delete bank account
  async deleteAccount(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { accountId } = req.params;
      await this.bankService.deleteAccount(userId, accountId);
      res.json({ message: 'Bank account deleted successfully' });
    } catch (error) {
      logger.error('Failed to delete bank account:', error);
      res.status(500).json({ error: 'Failed to delete bank account' });
    }
  }

  // Verify bank account
  async verifyAccount(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { accountId } = req.params;
      const { error } = validateRequest(req.body, bankSchema.verifyAccount);
      if (error) {
        return res.status(400).json({ error: error.details[0].message });
      }

      const { amount1, amount2 } = req.body;
      const account = await this.bankService.verifyAccount(userId, accountId, amount1, amount2);
      res.json({ account });
    } catch (error) {
      logger.error('Failed to verify bank account:', error);
      res.status(500).json({ error: 'Failed to verify bank account' });
    }
  }

  // Get bank account balance
  async getBalance(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { accountId } = req.params;
      const balance = await this.bankService.getAccountBalance(userId, accountId);
      res.json({ balance });
    } catch (error) {
      logger.error('Failed to get bank account balance:', error);
      res.status(500).json({ error: 'Failed to get bank account balance' });
    }
  }
} 