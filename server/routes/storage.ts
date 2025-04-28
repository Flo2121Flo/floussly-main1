import { Router } from 'express';
import { StorageController } from '../controllers/storage';
import { authenticate } from '../middleware/auth';
import multer from 'multer';

const router = Router();
const storageController = new StorageController();

// Configure multer for file uploads
const upload = multer({
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  }
});

// Cloud storage routes
router.post('/upload', authenticate, upload.single('file'), storageController.uploadFile.bind(storageController));
router.get('/files', authenticate, storageController.listFiles.bind(storageController));
router.get('/files/:fileId', authenticate, storageController.getFile.bind(storageController));
router.delete('/files/:fileId', authenticate, storageController.deleteFile.bind(storageController));
router.post('/files/:fileId/share', authenticate, storageController.shareFile.bind(storageController));
router.get('/files/:fileId/download', authenticate, storageController.downloadFile.bind(storageController));

export default router; 