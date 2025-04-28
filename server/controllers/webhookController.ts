import { Request, Response } from 'express';
import { PaymentGateway } from '../services/paymentGateway';
import prisma from '../database/schema';

export class WebhookController {
  static async handlePayDunyaWebhook(req: Request, res: Response) {
    try {
      const { token, status } = req.body;

      // Verify payment
      const verification = await PaymentGateway.verifyPayment(token);
      
      if (!verification.success) {
        return res.status(400).json({ error: 'Payment verification failed' });
      }

      const { transactionId, userId } = verification.metadata;

      // Update transaction status
      await prisma.transaction.update({
        where: { id: transactionId },
        data: {
          status: status === 'completed' ? 'completed' : 'failed'
        }
      });

      // Update user balance if payment was successful
      if (status === 'completed') {
        await prisma.user.update({
          where: { id: userId },
          data: {
            balance: {
              increment: verification.amount
            }
          }
        });
      }

      res.status(200).json({ success: true });
    } catch (error) {
      console.error('Webhook error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async handleM2TWebhook(req: Request, res: Response) {
    try {
      const { transfer_id, status } = req.body;

      // Update transaction status
      await prisma.transaction.update({
        where: { metadata: { path: ['transferId'], equals: transfer_id } },
        data: {
          status: status === 'completed' ? 'completed' : 'failed'
        }
      });

      res.status(200).json({ success: true });
    } catch (error) {
      console.error('Webhook error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
} 