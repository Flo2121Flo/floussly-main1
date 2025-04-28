import Joi from 'joi';

export const paymentSchema = {
  process: Joi.object({
    amount: Joi.number().positive().required(),
    currency: Joi.string().required(),
    description: Joi.string().required(),
    sourceAccountId: Joi.string().required(),
    destinationAccountId: Joi.string().required(),
    metadata: Joi.object(),
  }),

  refund: Joi.object({
    amount: Joi.number().positive().required(),
    reason: Joi.string().required(),
  }),
}; 