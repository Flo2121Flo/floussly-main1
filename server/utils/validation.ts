import { body, param, query, validationResult } from 'express-validator';
import { logger } from './logger';

// Common validation chains
export const validateTransaction = [
  body('amount').isFloat({ min: 0.01 }).withMessage('Amount must be greater than 0'),
  body('currency').isIn(['MAD']).withMessage('Invalid currency'),
  body('recipientId').isString().withMessage('Invalid recipient ID'),
  body('note').optional().isString().isLength({ max: 200 }).withMessage('Note too long'),
];

export const validateKycDocument = [
  body('documentType').isIn(['CIN', 'PASSPORT', 'RESIDENCE_PERMIT']).withMessage('Invalid document type'),
  body('file').custom((value, { req }) => {
    if (!req.file) {
      throw new Error('No file uploaded');
    }
    
    const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
    if (!allowedTypes.includes(req.file.mimetype)) {
      throw new Error('Invalid file type');
    }
    
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (req.file.size > maxSize) {
      throw new Error('File too large');
    }
    
    return true;
  }),
];

export const validateDaretCreation = [
  body('amount').isFloat({ min: 0.01 }).withMessage('Amount must be greater than 0'),
  body('frequency').isIn(['WEEKLY', 'MONTHLY']).withMessage('Invalid frequency'),
  body('startDate').isISO8601().withMessage('Invalid start date'),
  body('members').isArray({ min: 2 }).withMessage('At least 2 members required'),
  body('members.*.userId').isString().withMessage('Invalid member ID'),
];

export const validateTopUp = [
  body('amount').isFloat({ min: 0.01 }).withMessage('Amount must be greater than 0'),
  body('paymentMethod').isIn(['BANK_TRANSFER', 'CARD']).withMessage('Invalid payment method'),
  body('bankAccountId').if(body('paymentMethod').equals('BANK_TRANSFER')).isString().withMessage('Bank account ID required'),
];

export const validateWithdrawal = [
  body('amount').isFloat({ min: 0.01 }).withMessage('Amount must be greater than 0'),
  body('bankAccountId').isString().withMessage('Bank account ID required'),
];

// Validation middleware
export const validate = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    logger.warn('Validation failed', {
      path: req.path,
      errors: errors.array(),
      ip: req.ip,
    });
    
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array().map(err => ({
        field: err.param,
        message: err.msg
      }))
    });
  }
  next();
};

// Sanitization middleware
export const sanitize = (req: Request, res: Response, next: NextFunction) => {
  // Sanitize query parameters
  if (req.query) {
    Object.keys(req.query).forEach(key => {
      if (typeof req.query[key] === 'string') {
        req.query[key] = req.query[key]?.toString().trim();
      }
    });
  }

  // Sanitize body parameters
  if (req.body) {
    Object.keys(req.body).forEach(key => {
      if (typeof req.body[key] === 'string') {
        req.body[key] = req.body[key].trim();
      }
    });
  }

  next();
}; 