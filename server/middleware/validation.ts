import Joi from 'joi';
import { Request, Response, NextFunction } from 'express';
import { ValidationError } from '../utils/error';
import { logger } from '../utils/logger';

// Common validation schemas
export const commonSchemas = {
  id: Joi.string().uuid().required(),
  email: Joi.string().email().required(),
  phone: Joi.string().pattern(/^\+[1-9]\d{1,14}$/).required(),
  amount: Joi.number().positive().precision(2).required(),
  password: Joi.string().min(8).pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/).required(),
  date: Joi.date().iso().required(),
  boolean: Joi.boolean().required(),
  string: Joi.string().required(),
  number: Joi.number().required(),
};

// Transaction validation schemas
export const transactionSchemas = {
  create: Joi.object({
    recipientId: commonSchemas.id,
    amount: commonSchemas.amount,
    description: Joi.string().max(255),
    metadata: Joi.object(),
  }),

  withdraw: Joi.object({
    amount: commonSchemas.amount,
    bankAccountId: commonSchemas.id,
    description: Joi.string().max(255),
  }),

  deposit: Joi.object({
    amount: commonSchemas.amount,
    bankAccountId: commonSchemas.id,
    description: Joi.string().max(255),
  }),
};

// Tontine validation schemas
export const tontineSchemas = {
  create: Joi.object({
    name: Joi.string().min(3).max(100).required(),
    contribution: commonSchemas.amount,
    duration: Joi.number().integer().min(1).max(52).required(),
    frequency: Joi.string().valid('WEEKLY', 'MONTHLY').required(),
    maxMembers: Joi.number().integer().min(2).max(50).required(),
    description: Joi.string().max(500),
  }),

  join: Joi.object({
    tontineId: commonSchemas.id,
  }),

  contribute: Joi.object({
    tontineId: commonSchemas.id,
    amount: commonSchemas.amount,
  }),
};

// Message validation schemas
export const messageSchemas = {
  send: Joi.object({
    recipientId: commonSchemas.id,
    content: Joi.string().max(1000).required(),
    type: Joi.string().valid('TEXT', 'IMAGE', 'MONEY').required(),
    metadata: Joi.object(),
    expiresAt: Joi.date().iso().min('now'),
  }),

  moneyMessage: Joi.object({
    recipientId: commonSchemas.id,
    amount: commonSchemas.amount,
    message: Joi.string().max(255),
    expiresAt: Joi.date().iso().min('now'),
  }),
};

// QR code validation schemas
export const qrCodeSchemas = {
  generate: Joi.object({
    type: Joi.string().valid('PAYMENT', 'WITHDRAWAL', 'DEPOSIT').required(),
    amount: commonSchemas.amount,
    description: Joi.string().max(255),
    metadata: Joi.object(),
    expiresAt: Joi.date().iso().min('now'),
  }),

  scan: Joi.object({
    qrCodeId: commonSchemas.id,
  }),
};

// User validation schemas
export const userSchemas = {
  register: Joi.object({
    email: commonSchemas.email,
    phone: commonSchemas.phone,
    password: commonSchemas.password,
    firstName: Joi.string().min(2).max(50).required(),
    lastName: Joi.string().min(2).max(50).required(),
    dateOfBirth: Joi.date().iso().max('now').required(),
  }),

  update: Joi.object({
    firstName: Joi.string().min(2).max(50),
    lastName: Joi.string().min(2).max(50),
    phone: commonSchemas.phone,
    dateOfBirth: Joi.date().iso().max('now'),
  }),

  changePassword: Joi.object({
    currentPassword: commonSchemas.password,
    newPassword: commonSchemas.password,
  }),
};

// Agent validation schemas
export const agentSchemas = {
  register: Joi.object({
    userId: commonSchemas.id,
    region: Joi.string().required(),
    businessName: Joi.string().min(3).max(100).required(),
    businessType: Joi.string().required(),
    address: Joi.string().required(),
    documents: Joi.array().items(Joi.string()).min(1).required(),
  }),

  update: Joi.object({
    businessName: Joi.string().min(3).max(100),
    businessType: Joi.string(),
    address: Joi.string(),
    status: Joi.string().valid('ACTIVE', 'SUSPENDED', 'INACTIVE'),
  }),
};

// Validation middleware factory
export const validate = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const { error } = schema.validate(req.body, {
        abortEarly: false,
        stripUnknown: true,
      });

      if (error) {
        const errors = error.details.map((detail) => ({
          field: detail.path.join('.'),
          message: detail.message,
        }));

        logger.warn('Validation failed', {
          path: req.path,
          errors,
          body: req.body,
        });

        throw new ValidationError('Validation failed', errors);
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

// Query validation middleware factory
export const validateQuery = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const { error } = schema.validate(req.query, {
        abortEarly: false,
        stripUnknown: true,
      });

      if (error) {
        const errors = error.details.map((detail) => ({
          field: detail.path.join('.'),
          message: detail.message,
        }));

        logger.warn('Query validation failed', {
          path: req.path,
          errors,
          query: req.query,
        });

        throw new ValidationError('Query validation failed', errors);
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

// Params validation middleware factory
export const validateParams = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const { error } = schema.validate(req.params, {
        abortEarly: false,
        stripUnknown: true,
      });

      if (error) {
        const errors = error.details.map((detail) => ({
          field: detail.path.join('.'),
          message: detail.message,
        }));

        logger.warn('Params validation failed', {
          path: req.path,
          errors,
          params: req.params,
        });

        throw new ValidationError('Params validation failed', errors);
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

// Sanitization middleware
export const sanitize = (req: Request, res: Response, next: NextFunction) => {
  // Sanitize query parameters
  if (req.query) {
    Object.keys(req.query).forEach(key => {
      if (typeof req.query[key] === 'string') {
        req.query[key] = (req.query[key] as string).trim();
      }
    });
  }

  // Sanitize body parameters
  if (req.body) {
    Object.keys(req.body).forEach(key => {
      if (typeof req.body[key] === 'string') {
        req.body[key] = req.body[key].trim();
      }
    });
  }

  next();
}; 