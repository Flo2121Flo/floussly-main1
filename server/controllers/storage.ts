import { Request, Response } from 'express';
import { S3Service } from '../aws/s3';
import { logger } from '../utils/logger';

export class StorageController {
  private s3Service: S3Service;

  constructor() {
    this.s3Service = new S3Service();
  }

  // Upload a file
  async uploadFile(req: Request, res: Response) {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file provided' });
      }

      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const file = await this.s3Service.uploadFile(
        userId,
        req.file.buffer,
        req.file.originalname,
        req.file.mimetype
      );

      res.status(201).json({ file });
    } catch (error) {
      logger.error('Failed to upload file:', error);
      res.status(500).json({ error: 'Failed to upload file' });
    }
  }

  // List files
  async listFiles(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { prefix, limit = 10, continuationToken } = req.query;
      const files = await this.s3Service.listFiles(
        userId,
        prefix as string,
        Number(limit),
        continuationToken as string
      );

      res.json(files);
    } catch (error) {
      logger.error('Failed to list files:', error);
      res.status(500).json({ error: 'Failed to list files' });
    }
  }

  // Get file metadata
  async getFile(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { fileId } = req.params;
      const file = await this.s3Service.getFileMetadata(userId, fileId);

      if (!file) {
        return res.status(404).json({ error: 'File not found' });
      }

      res.json({ file });
    } catch (error) {
      logger.error('Failed to get file:', error);
      res.status(500).json({ error: 'Failed to get file' });
    }
  }

  // Delete file
  async deleteFile(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { fileId } = req.params;
      await this.s3Service.deleteFile(userId, fileId);

      res.json({ message: 'File deleted successfully' });
    } catch (error) {
      logger.error('Failed to delete file:', error);
      res.status(500).json({ error: 'Failed to delete file' });
    }
  }

  // Share file
  async shareFile(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { fileId } = req.params;
      const { expiresIn = 3600 } = req.body; // Default 1 hour

      const url = await this.s3Service.generatePresignedUrl(
        userId,
        fileId,
        Number(expiresIn)
      );

      res.json({ url });
    } catch (error) {
      logger.error('Failed to share file:', error);
      res.status(500).json({ error: 'Failed to share file' });
    }
  }

  // Download file
  async downloadFile(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { fileId } = req.params;
      const file = await this.s3Service.downloadFile(userId, fileId);

      if (!file) {
        return res.status(404).json({ error: 'File not found' });
      }

      res.setHeader('Content-Type', file.contentType);
      res.setHeader('Content-Disposition', `attachment; filename="${file.filename}"`);
      res.send(file.data);
    } catch (error) {
      logger.error('Failed to download file:', error);
      res.status(500).json({ error: 'Failed to download file' });
    }
  }
} 