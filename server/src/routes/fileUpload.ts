import { Router } from 'express';
import multer from 'multer';
import { FileUploadController } from '../controllers/FileUploadController';
import { authMiddleware } from '../middleware/auth';
import { rateLimitMiddleware } from '../middleware/rateLimit';

const router = Router();
const fileUploadController = new FileUploadController();

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
    files: 1
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  }
});

// Apply rate limiting to all routes
router.use(rateLimitMiddleware);

// Apply authentication to all routes
router.use(authMiddleware);

// Upload KYC document
router.post(
  '/kyc',
  upload.single('document'),
  fileUploadController.uploadKycDocument.bind(fileUploadController)
);

// Get user's KYC documents
router.get(
  '/kyc',
  fileUploadController.getKycDocuments.bind(fileUploadController)
);

// Delete KYC document
router.delete(
  '/kyc/:fileName',
  fileUploadController.deleteKycDocument.bind(fileUploadController)
);

export default router; 