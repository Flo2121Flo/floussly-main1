import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { AppError } from '../utils/error';
import { logger } from '../utils/logger';

export const validate = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const errorMessage = error.details
        .map(detail => detail.message)
        .join(', ');

      logger.warn('Validation error', {
        path: req.path,
        method: req.method,
        correlationId: req.correlationId,
        errors: error.details
      });

      throw new AppError(
        errorMessage,
        400,
        'VALIDATION_ERROR',
        { details: error.details }
      );
    }

    next();
  };
};

// Common validation schemas
export const schemas = {
  // User schemas
  createUser: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(8).required(),
    name: Joi.string().required(),
    phone: Joi.string().pattern(/^\+?[1-9]\d{1,14}$/).required()
  }),

  updateUser: Joi.object({
    name: Joi.string(),
    phone: Joi.string().pattern(/^\+?[1-9]\d{1,14}$/),
    email: Joi.string().email()
  }),

  // Transaction schemas
  createTransaction: Joi.object({
    idempotencyKey: Joi.string().required(),
    receiverId: Joi.string().required(),
    amount: Joi.number().positive().required(),
    type: Joi.string().valid('TRANSFER', 'WITHDRAWAL', 'DEPOSIT').required(),
    description: Joi.string().max(500),
    metadata: Joi.object()
  }),

  // Tontine schemas
  createTontine: Joi.object({
    name: Joi.string().required(),
    description: Joi.string().max(1000),
    contribution: Joi.number().positive().required(),
    duration: Joi.number().integer().min(1).required(),
    frequency: Joi.string().valid('WEEKLY', 'MONTHLY').required(),
    maxMembers: Joi.number().integer().min(2).max(50).required()
  }),

  joinTontine: Joi.object({
    tontineId: Joi.string().required()
  }),

  // Payment schemas
  processPayment: Joi.object({
    amount: Joi.number().positive().required(),
    currency: Joi.string().length(3).required(),
    paymentMethod: Joi.string().required(),
    description: Joi.string().max(500),
    metadata: Joi.object()
  }),

  // KYC schemas
  submitKyc: Joi.object({
    documentType: Joi.string().valid('PASSPORT', 'ID_CARD', 'DRIVERS_LICENSE').required(),
    documentNumber: Joi.string().required(),
    documentImage: Joi.string().required(),
    selfieImage: Joi.string().required(),
    address: Joi.object({
      street: Joi.string().required(),
      city: Joi.string().required(),
      state: Joi.string().required(),
      country: Joi.string().required(),
      postalCode: Joi.string().required()
    }).required()
  })
}; 