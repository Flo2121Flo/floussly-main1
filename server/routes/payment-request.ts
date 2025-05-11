import { Router } from 'express';
import { PaymentRequestController } from '../controllers/payment-request';
import { authenticate } from '../middleware/auth';
import { rateLimit } from '../middleware/rate-limiter';
import { antiFraudMiddleware } from '../middleware/anti-fraud';
import { validateRequest } from '../middleware/validation';
import { paymentRequestSchema } from '../schemas/payment-request';

const router = Router();

// Apply authentication middleware to all routes
router.use(authenticate);

// Apply anti-fraud middleware to all routes
router.use(antiFraudMiddleware);

// Create a new payment request
router.post(
  '/create',
  rateLimit.transaction,
  validateRequest(paymentRequestSchema.create),
  PaymentRequestController.create
);

// Get payment requests sent by the user
router.get(
  '/sent',
  rateLimit.user,
  PaymentRequestController.getSent
);

// Get payment requests received by the user
router.get(
  '/received',
  rateLimit.user,
  PaymentRequestController.getReceived
);

// Pay a payment request
router.post(
  '/:id/pay',
  rateLimit.transaction,
  validateRequest(paymentRequestSchema.pay),
  PaymentRequestController.pay
);

// Decline a payment request
router.post(
  '/:id/decline',
  rateLimit.user,
  validateRequest(paymentRequestSchema.decline),
  PaymentRequestController.decline
);

export default router; 