import { Request, Response } from 'express';
import { PaymentService } from '../services/payment';
import { validateRequest } from '../middleware/validate';
import { paymentSchema } from '../validations/payment';
import { logger } from '../utils/logger';

export class PaymentController {
  private paymentService: PaymentService;

  constructor() {
    this.paymentService = new PaymentService();
  }

  // Process a payment
  async processPayment(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { error } = validateRequest(req.body, paymentSchema.process);
      if (error) {
        return res.status(400).json({ error: error.details[0].message });
      }

      const payment = await this.paymentService.processPayment(userId, req.body);
      res.status(201).json({ payment });
    } catch (error) {
      logger.error('Failed to process payment:', error);
      res.status(500).json({ error: 'Failed to process payment' });
    }
  }

  // Get payment status
  async getPaymentStatus(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { paymentId } = req.params;
      const status = await this.paymentService.getPaymentStatus(userId, paymentId);
      res.json({ status });
    } catch (error) {
      logger.error('Failed to get payment status:', error);
      res.status(500).json({ error: 'Failed to get payment status' });
    }
  }

  // Get payment history
  async getPaymentHistory(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { page = 1, limit = 10, status, startDate, endDate } = req.query;
      const payments = await this.paymentService.getPaymentHistory(userId, {
        page: Number(page),
        limit: Number(limit),
        status: status as string,
        startDate: startDate as string,
        endDate: endDate as string,
      });

      res.json(payments);
    } catch (error) {
      logger.error('Failed to get payment history:', error);
      res.status(500).json({ error: 'Failed to get payment history' });
    }
  }

  // Refund a payment
  async refundPayment(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { paymentId } = req.params;
      const { error } = validateRequest(req.body, paymentSchema.refund);
      if (error) {
        return res.status(400).json({ error: error.details[0].message });
      }

      const refund = await this.paymentService.refundPayment(userId, paymentId, req.body);
      res.json({ refund });
    } catch (error) {
      logger.error('Failed to refund payment:', error);
      res.status(500).json({ error: 'Failed to refund payment' });
    }
  }

  // Get payment details
  async getPaymentDetails(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { paymentId } = req.params;
      const payment = await this.paymentService.getPaymentDetails(userId, paymentId);

      if (!payment) {
        return res.status(404).json({ error: 'Payment not found' });
      }

      res.json({ payment });
    } catch (error) {
      logger.error('Failed to get payment details:', error);
      res.status(500).json({ error: 'Failed to get payment details' });
    }
  }
} 