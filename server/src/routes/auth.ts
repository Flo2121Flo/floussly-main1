import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { authMiddleware, requireMFA, requireBiometric } from '../middleware/auth';
import { rateLimit } from 'express-rate-limit';

const router = Router();
const authController = AuthController.getInstance();

// Rate limiting
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts
  message: 'Too many login attempts, please try again later'
});

const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 attempts
  message: 'Too many registration attempts, please try again later'
});

// Public routes
router.post('/register', registerLimiter, (req, res) => authController.register(req, res));
router.post('/login', loginLimiter, (req, res) => authController.login(req, res));

// Protected routes
router.post('/mfa/verify', authMiddleware, (req, res) => authController.verifyMFA(req, res));
router.post('/mfa/setup', authMiddleware, (req, res) => authController.setupMFA(req, res));
router.post('/biometric/verify', authMiddleware, (req, res) => authController.verifyBiometric(req, res));
router.post('/logout', authMiddleware, (req, res) => authController.logout(req, res));

// Routes requiring MFA
router.post('/sensitive/action', authMiddleware, requireMFA, (req, res) => {
  // Handle sensitive actions
  res.json({ message: 'Sensitive action completed' });
});

// Routes requiring biometric
router.post('/high-risk/action', authMiddleware, requireBiometric, (req, res) => {
  // Handle high-risk actions
  res.json({ message: 'High-risk action completed' });
});

export default router; 