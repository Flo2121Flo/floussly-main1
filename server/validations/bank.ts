import Joi from 'joi';

export const bankSchema = {
  linkAccount: Joi.object({
    bankName: Joi.string().required(),
    accountNumber: Joi.string().required(),
    routingNumber: Joi.string().required(),
    accountType: Joi.string().valid('checking', 'savings').required(),
    accountHolderName: Joi.string().required(),
  }),

  updateAccount: Joi.object({
    bankName: Joi.string(),
    accountNumber: Joi.string(),
    routingNumber: Joi.string(),
    accountType: Joi.string().valid('checking', 'savings'),
    accountHolderName: Joi.string(),
    isVerified: Joi.boolean(),
  }),

  verifyAccount: Joi.object({
    amount1: Joi.number().required(),
    amount2: Joi.number().required(),
  }),
}; 