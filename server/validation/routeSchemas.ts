import { z } from 'zod';

export const authSchemas = {
  login: z.object({
    body: z.object({
      email: z.string().email(),
      password: z.string().min(8),
    }),
  }),
  register: z.object({
    body: z.object({
      email: z.string().email(),
      password: z.string().min(8),
      phone: z.string().regex(/^\+212[0-9]{9}$/),
      language: z.enum(['en', 'fr', 'ar', 'tzm']),
    }),
  }),
};

export const walletSchemas = {
  withdraw: z.object({
    body: z.object({
      amount: z.number().positive(),
      bankDetails: z.object({
        accountNumber: z.string(),
        bankName: z.string(),
      }),
    }),
  }),
  topUp: z.object({
    body: z.object({
      amount: z.number().positive(),
      paymentMethod: z.enum(['PAYDUNYA', 'M2T', 'CASH']),
    }),
  }),
};

export const messageSchemas = {
  send: z.object({
    body: z.object({
      recipientId: z.string().uuid(),
      content: z.string(),
      type: z.enum(['TEXT', 'VOICE', 'SYSTEM']),
      metadata: z.record(z.unknown()).optional(),
    }),
  }),
};

export const treasureSchemas = {
  create: z.object({
    body: z.object({
      amount: z.number().positive(),
      location: z.object({
        latitude: z.number(),
        longitude: z.number(),
      }),
      unlockMethod: z.enum(['GEO', 'QR', 'CODE']),
      invitedUsers: z.array(z.string().uuid()),
      expiryHours: z.number().positive().optional(),
    }),
  }),
  unlock: z.object({
    params: z.object({
      treasureId: z.string().uuid(),
    }),
    body: z.object({
      unlockCode: z.string().optional(),
      location: z.object({
        latitude: z.number(),
        longitude: z.number(),
      }).optional(),
    }),
  }),
}; 