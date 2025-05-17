import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { 
  authMiddleware, 
  requireMFA, 
  requireBiometric, 
  requireAdmin,
  sanitizeInputs,
  securityHeaders,
  apiLimiter
} from '../middleware/auth';
import { rateLimit } from 'express-rate-limit';

const router = Router();
const authController = AuthController.getInstance();

// Apply security headers to all routes
router.use(securityHeaders);

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

// Public routes with rate limiting and input sanitization
router.post('/register', registerLimiter, sanitizeInputs, (req, res) => authController.register(req, res));
router.post('/login', loginLimiter, sanitizeInputs, (req, res) => authController.login(req, res));

// Protected routes with rate limiting and input sanitization
router.post('/mfa/verify', authMiddleware, apiLimiter, sanitizeInputs, (req, res) => authController.verifyMFA(req, res));
router.post('/mfa/setup', authMiddleware, apiLimiter, sanitizeInputs, (req, res) => authController.setupMFA(req, res));
router.post('/biometric/verify', authMiddleware, apiLimiter, sanitizeInputs, (req, res) => authController.verifyBiometric(req, res));
router.post('/logout', authMiddleware, apiLimiter, (req, res) => authController.logout(req, res));

// Routes requiring MFA
router.post('/sensitive/action', 
  authMiddleware, 
  requireMFA, 
  apiLimiter, 
  sanitizeInputs, 
  (req, res) => {
    // Handle sensitive actions
    res.json({ message: 'Sensitive action completed' });
  }
);

// Routes requiring biometric
router.post('/high-risk/action', 
  authMiddleware, 
  requireBiometric, 
  apiLimiter, 
  sanitizeInputs, 
  (req, res) => {
    // Handle high-risk actions
    res.json({ message: 'High-risk action completed' });
  }
);

// Admin routes
router.get('/admin/users', 
  authMiddleware, 
  requireAdmin, 
  apiLimiter, 
  (req, res) => {
    // Handle admin user list
    res.json({ message: 'Admin user list' });
  }
);

export default router; 