import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import { StorageConfig, FileMetadata, UploadResult } from './types';
import { ERRORS } from './errors';
import { generateUniqueFilename, validateFile, createFileMetadata, sanitizePath } from './utils';

export class StorageService {
  private config: StorageConfig;
  private storage: multer.StorageEngine;

  constructor(config: StorageConfig) {
    this.config = config;
    this.storage = multer.diskStorage({
      destination: (req, file, cb) => {
        cb(null, config.uploadDir);
      },
      filename: (req, file, cb) => {
        const uniqueFilename = generateUniqueFilename(file.originalname);
        cb(null, uniqueFilename);
      }
    });
  }

  getUploadMiddleware(): multer.Multer {
    return multer({
      storage: this.storage,
      limits: {
        fileSize: this.config.maxFileSize
      },
      fileFilter: (req, file, cb) => {
        if (!this.config.allowedMimeTypes.includes(file.mimetype)) {
          cb(new Error('Invalid file type'));
          return;
        }
        cb(null, true);
      }
    });
  }

  async uploadFile(
    file: Express.Multer.File,
    userId: string,
    metadata?: Record<string, any>
  ): Promise<UploadResult> {
    try {
      validateFile(file, this.config);
      const filename = generateUniqueFilename(file.originalname);
      const fileMetadata = createFileMetadata(file, userId, filename);
      
      return {
        success: true,
        file: fileMetadata,
        metadata
      };
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Upload failed: ${error.message}`);
      }
      throw ERRORS.UPLOAD_FAILED;
    }
  }

  async deleteFile(fileId: string): Promise<void> {
    // Implementation for deleting a file
  }

  async getFileMetadata(fileId: string): Promise<FileMetadata> {
    // Implementation for getting file metadata
    throw new Error('Not implemented');
  }
} 