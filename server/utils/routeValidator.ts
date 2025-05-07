import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { AppError } from './errors';

export const validateRequest = (schema: z.ZodSchema) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        next(new AppError(400, 'Invalid request data', 'VALIDATION_ERROR'));
      } else {
        next(error);
      }
    }
  };
};

export const validateResponse = (schema: z.ZodSchema) => {
  return (data: unknown) => {
    try {
      return schema.parse(data);
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new AppError(500, 'Invalid response data', 'RESPONSE_VALIDATION_ERROR');
      }
      throw error;
    }
  };
}; 