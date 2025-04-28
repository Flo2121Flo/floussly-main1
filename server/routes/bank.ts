import { Router } from 'express';
import { BankController } from '../controllers/bank';
import { validate } from '../middleware/validation';
import { bankSchema } from '../validations/bank';
import { authenticate } from '../middleware/auth';

const router = Router();
const bankController = new BankController();

// Bank account routes
router.post('/accounts', authenticate, validate(bankSchema.linkAccount), bankController.linkAccount.bind(bankController));
router.get('/accounts', authenticate, bankController.getAccounts.bind(bankController));
router.get('/accounts/:accountId', authenticate, bankController.getAccount.bind(bankController));
router.put('/accounts/:accountId', authenticate, validate(bankSchema.updateAccount), bankController.updateAccount.bind(bankController));
router.delete('/accounts/:accountId', authenticate, bankController.deleteAccount.bind(bankController));
router.post('/accounts/:accountId/verify', authenticate, validate(bankSchema.verifyAccount), bankController.verifyAccount.bind(bankController));
router.get('/accounts/:accountId/balance', authenticate, bankController.getBalance.bind(bankController));

export default router;