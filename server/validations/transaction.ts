import Joi from 'joi';

export const transactionSchema = {
  create: Joi.object({
    type: Joi.string().valid('credit', 'debit', 'transfer').required(),
    amount: Joi.number().positive().required(),
    currency: Joi.string().required(),
    description: Joi.string().required(),
    metadata: Joi.object(),
  }),

  updateStatus: Joi.object({
    status: Joi.string().valid('pending', 'completed', 'failed').required(),
  }),
}; 