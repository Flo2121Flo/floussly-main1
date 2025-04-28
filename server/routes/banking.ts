import express from 'express';
import { validateRequest } from '../middleware/validation';
import {
  getAccountBalance,
  initiateTransfer,
  getExchangeRate,
  getBankHolidays,
  getSupportedBanks
} from '../controllers/banking';

const router = express.Router();

// Get account balance
router.get('/banks/:bankCode/accounts/:accountNumber/balance', getAccountBalance);

// Initiate transfer
router.post('/banks/:bankCode/transfers', validateRequest({
  body: {
    fromAccount: { type: 'string', required: true },
    toAccount: { type: 'string', required: true },
    amount: { type: 'number', required: true },
    currency: { type: 'string', required: true },
    description: { type: 'string', required: true }
  }
}), initiateTransfer);

// Get exchange rate
router.get('/exchange-rates', getExchangeRate);

// Get bank holidays
router.get('/holidays/:year', getBankHolidays);

// Get supported banks
router.get('/banks', getSupportedBanks);

export default router; 