import { Router } from 'express';
import { UserController } from '../controllers/user';
import { validate } from '../middleware/validation';
import { userSchema } from '../validations/user';
import { authenticate } from '../middleware/auth';

const router = Router();
const userController = new UserController();

// Authentication routes
router.post('/register', validate(userSchema.register), userController.register.bind(userController));
router.post('/login', validate(userSchema.login), userController.login.bind(userController));
router.post('/logout', authenticate, userController.logout.bind(userController));

// Profile routes
router.get('/profile', authenticate, userController.getProfile.bind(userController));
router.put('/profile', authenticate, validate(userSchema.update), userController.updateProfile.bind(userController));
router.put('/password', authenticate, validate(userSchema.changePassword), userController.changePassword.bind(userController));

// Password reset routes
router.post('/password/reset-request', validate(userSchema.requestPasswordReset), userController.requestPasswordReset.bind(userController));
router.post('/password/reset', validate(userSchema.resetPassword), userController.resetPassword.bind(userController));

// Email verification
router.get('/verify-email/:token', userController.verifyEmail.bind(userController));

// KYC routes
router.post('/kyc/upload', authenticate, userController.uploadKycDocument.bind(userController));
router.get('/kyc/documents', authenticate, userController.getKycDocuments.bind(userController));
router.get('/kyc/status', authenticate, userController.getKycStatus.bind(userController));

export default router; 