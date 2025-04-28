import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { logError } from '../utils/logger';

interface ValidationSchema {
  body?: Joi.ObjectSchema;
  params?: Joi.ObjectSchema;
  query?: Joi.ObjectSchema;
}

interface ValidationErrorDetail {
  field: string;
  message: string;
}

interface JoiValidationErrorDetail {
  path: string[];
  message: string;
}

export const validateRequest = (schema: ValidationSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const validationOptions = {
      abortEarly: false,
      allowUnknown: true,
      stripUnknown: true
    };

    const { error } = Joi.object(schema).validate(req, validationOptions);

    if (error) {
      const errors: ValidationErrorDetail[] = error.details.map((detail) => ({
        field: detail.path.map(String).join('.'),
        message: detail.message
      }));

      return res.status(400).json({
        error: 'Validation failed',
        details: errors
      });
    }

    next();
  };
};

export const validate = (schema: Joi.ObjectSchema) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const value = await schema.validateAsync(req.body, {
        abortEarly: false,
        stripUnknown: true
      });
      req.body = value;
      next();
    } catch (error: unknown) {
      if (error instanceof Joi.ValidationError) {
        logError(new Error(error.message), 'ValidationMiddleware');
        res.status(400).json({
          error: 'Validation failed',
          details: error.details.map((detail) => ({
            field: detail.path.map(String).join('.'),
            message: detail.message
          }))
        });
      } else {
        logError(error as Error, 'ValidationMiddleware');
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  };
}; 