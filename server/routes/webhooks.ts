import express from 'express';
import { WebhookController } from '../controllers/webhookController';

const router = express.Router();

// PayDunya webhook
router.post('/paydunya', WebhookController.handlePayDunyaWebhook);

// M2T webhook
router.post('/m2t', WebhookController.handleM2TWebhook);

export default router; 