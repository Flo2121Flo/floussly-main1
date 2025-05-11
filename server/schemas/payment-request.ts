import Joi from 'joi';

export const paymentRequestSchema = {
  create: Joi.object({
    receiverId: Joi.string().required(),
    amount: Joi.number().positive().required(),
    currency: Joi.string().length(3).required(),
    message: Joi.string().max(200).optional(),
    expiresIn: Joi.number().min(1).max(168).optional(), // 1 hour to 1 week
  }),

  pay: Joi.object({
    // Add any additional fields needed for payment
    // For example, payment method, confirmation code, etc.
  }),

  decline: Joi.object({
    reason: Joi.string().max(200).optional(),
  }),
}; 