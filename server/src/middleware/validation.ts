import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

export const validateRequest = (schema: any) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.validateAsync(req.body);
      next();
    } catch (error: any) {
      logger.error('Validation error', { error: error.message });
      res.status(400).json({
        error: 'Validation error',
        details: error.message
      });
    }
  };
}; 