import { Request, Response, NextFunction } from 'express';
import { AMLMonitor } from '../services/aml-monitor';
import { logger } from '../utils/logger';

export const amlMonitoringMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Only monitor POST requests to transaction-related endpoints
    if (req.method === 'POST' && (
      req.path.includes('/transactions') ||
      req.path.includes('/transfer') ||
      req.path.includes('/withdraw') ||
      req.path.includes('/topup')
    )) {
      const transaction = req.body;
      
      // Get AML monitor instance
      const amlMonitor = AMLMonitor.getInstance();
      
      // Monitor transaction asynchronously
      amlMonitor.monitorTransaction(transaction)
        .catch(error => {
          logger.error('Failed to monitor transaction', {
            error,
            transactionId: transaction.id,
          });
        });
    }
    
    next();
  } catch (error) {
    logger.error('AML monitoring middleware failed', { error });
    next();
  }
}; 