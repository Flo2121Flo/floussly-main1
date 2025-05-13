import { Request, Response } from 'express';
import { S3 } from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';
import { FileValidationService } from '../services/FileValidationService';
import { logger } from '../utils/logger';
import { redis } from '../config/redis';

const s3 = new S3();
const fileValidationService = FileValidationService.getInstance();

export class FileUploadController {
  public async uploadKycDocument(req: Request, res: Response): Promise<void> {
    try {
      if (!req.file) {
        res.status(400).json({ error: 'No file uploaded' });
        return;
      }

      const { userId } = req.user;
      const file = req.file;
      const fileStream = file.buffer;

      // Validate file
      const validationResult = await fileValidationService.validateFile(
        fileStream,
        file.originalname,
        file.size
      );

      if (!validationResult.isValid) {
        res.status(400).json({
          error: 'File validation failed',
          details: validationResult.errors
        });
        return;
      }

      // Generate unique file name
      const fileExtension = file.originalname.split('.').pop();
      const fileName = `${userId}/${uuidv4()}.${fileExtension}`;

      // Upload to S3
      const uploadResult = await s3.upload({
        Bucket: process.env.AWS_S3_BUCKET!,
        Key: fileName,
        Body: fileStream,
        ContentType: validationResult.mimeType,
        Metadata: {
          userId,
          originalName: file.originalname,
          validated: 'true'
        }
      }).promise();

      // Store file metadata in Redis for quick access
      await redis.hset(`user:${userId}:documents`, fileName, JSON.stringify({
        url: uploadResult.Location,
        type: validationResult.mimeType,
        size: file.size,
        uploadedAt: new Date().toISOString()
      }));

      // Log successful upload
      logger.info('KYC document uploaded successfully', {
        userId,
        fileName,
        fileSize: file.size,
        mimeType: validationResult.mimeType
      });

      res.status(200).json({
        message: 'File uploaded successfully',
        fileUrl: uploadResult.Location,
        fileName
      });
    } catch (error) {
      logger.error('File upload error', {
        error: error.message,
        userId: req.user?.userId
      });

      res.status(500).json({
        error: 'Failed to upload file',
        details: error.message
      });
    }
  }

  public async getKycDocuments(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.user;
      const documents = await redis.hgetall(`user:${userId}:documents`);

      const parsedDocuments = Object.entries(documents).map(([fileName, metadata]) => ({
        fileName,
        ...JSON.parse(metadata)
      }));

      res.status(200).json({
        documents: parsedDocuments
      });
    } catch (error) {
      logger.error('Failed to retrieve KYC documents', {
        error: error.message,
        userId: req.user?.userId
      });

      res.status(500).json({
        error: 'Failed to retrieve documents',
        details: error.message
      });
    }
  }

  public async deleteKycDocument(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.user;
      const { fileName } = req.params;

      // Verify ownership
      const documentMetadata = await redis.hget(`user:${userId}:documents`, fileName);
      if (!documentMetadata) {
        res.status(404).json({ error: 'Document not found' });
        return;
      }

      // Delete from S3
      await s3.deleteObject({
        Bucket: process.env.AWS_S3_BUCKET!,
        Key: fileName
      }).promise();

      // Remove from Redis
      await redis.hdel(`user:${userId}:documents`, fileName);

      logger.info('KYC document deleted successfully', {
        userId,
        fileName
      });

      res.status(200).json({
        message: 'Document deleted successfully'
      });
    } catch (error) {
      logger.error('Failed to delete KYC document', {
        error: error.message,
        userId: req.user?.userId,
        fileName: req.params.fileName
      });

      res.status(500).json({
        error: 'Failed to delete document',
        details: error.message
      });
    }
  }
} 