import AWS from 'aws-sdk';
import { config } from '../config';
import logger from '../utils/logger';

export class S3Service {
  private static instance: S3Service;
  private s3: AWS.S3;
  private bucket: string;

  private constructor() {
    this.s3 = new AWS.S3({
      accessKeyId: config.aws.accessKeyId,
      secretAccessKey: config.aws.secretAccessKey,
      region: config.aws.region
    });
    this.bucket = config.aws.s3Bucket;
  }

  public static getInstance(): S3Service {
    if (!S3Service.instance) {
      S3Service.instance = new S3Service();
    }
    return S3Service.instance;
  }

  // Upload a file
  async uploadFile(userId: string, buffer: Buffer, filename: string, contentType: string): Promise<AWS.S3.ManagedUpload.SendData> {
    try {
      const key = `${userId}/${Date.now()}-${filename}`;
      const params = {
        Bucket: this.bucket,
        Key: key,
        Body: buffer,
        ContentType: contentType,
        Metadata: {
          userId,
          originalName: filename
        }
      };

      const result = await this.s3.upload(params).promise();
      logger.info(`File uploaded successfully: ${result.Key}`);
      return result;
    } catch (error) {
      logger.error('Failed to upload file to S3:', error);
      throw error;
    }
  }

  // List files
  async listFiles(userId: string, prefix?: string, limit: number = 10, continuationToken?: string): Promise<AWS.S3.ListObjectsV2Output> {
    try {
      const params: AWS.S3.ListObjectsV2Request = {
        Bucket: this.bucket,
        Prefix: prefix ? `${userId}/${prefix}` : `${userId}/`,
        MaxKeys: limit,
        ContinuationToken: continuationToken
      };

      const result = await this.s3.listObjectsV2(params).promise();
      return result;
    } catch (error) {
      logger.error('Failed to list files from S3:', error);
      throw error;
    }
  }

  // Get file metadata
  async getFileMetadata(userId: string, fileId: string): Promise<AWS.S3.HeadObjectOutput> {
    try {
      const params = {
        Bucket: this.bucket,
        Key: `${userId}/${fileId}`
      };

      const result = await this.s3.headObject(params).promise();
      return result;
    } catch (error) {
      logger.error('Failed to get file metadata from S3:', error);
      throw error;
    }
  }

  // Delete file
  async deleteFile(userId: string, fileId: string): Promise<AWS.S3.DeleteObjectOutput> {
    try {
      const params = {
        Bucket: this.bucket,
        Key: `${userId}/${fileId}`
      };

      const result = await this.s3.deleteObject(params).promise();
      logger.info(`File deleted successfully: ${fileId}`);
      return result;
    } catch (error) {
      logger.error('Failed to delete file from S3:', error);
      throw error;
    }
  }

  // Generate presigned URL
  async generatePresignedUrl(userId: string, fileId: string, expiresIn: number): Promise<string> {
    try {
      const params = {
        Bucket: this.bucket,
        Key: `${userId}/${fileId}`,
        Expires: expiresIn
      };

      const url = await this.s3.getSignedUrlPromise('getObject', params);
      return url;
    } catch (error) {
      logger.error('Failed to generate presigned URL:', error);
      throw error;
    }
  }

  // Download file
  async downloadFile(userId: string, fileId: string): Promise<{ data: Buffer; contentType: string; filename: string }> {
    try {
      const params = {
        Bucket: this.bucket,
        Key: `${userId}/${fileId}`
      };

      const result = await this.s3.getObject(params).promise();
      
      return {
        data: result.Body as Buffer,
        contentType: result.ContentType || 'application/octet-stream',
        filename: result.Metadata?.originalName || fileId
      };
    } catch (error) {
      logger.error('Failed to download file from S3:', error);
      throw error;
    }
  }

  // Upload KYC document
  async uploadKycDocument(userId: string, documentType: string, buffer: Buffer): Promise<string> {
    try {
      const key = `kyc/${userId}/${documentType}-${Date.now()}.pdf`;
      const params = {
        Bucket: this.bucket,
        Key: key,
        Body: buffer,
        ContentType: 'application/pdf',
        Metadata: {
          userId,
          documentType
        }
      };

      const result = await this.s3.upload(params).promise();
      logger.info(`KYC document uploaded successfully: ${result.Key}`);
      return result.Key;
    } catch (error) {
      logger.error('Failed to upload KYC document:', error);
      throw error;
    }
  }

  // Get KYC document
  async getKycDocument(documentKey: string): Promise<Buffer> {
    try {
      const params = {
        Bucket: this.bucket,
        Key: documentKey
      };

      const result = await this.s3.getObject(params).promise();
      return result.Body as Buffer;
    } catch (error) {
      logger.error('Failed to get KYC document:', error);
      throw error;
    }
  }

  // Delete KYC document
  async deleteKycDocument(documentKey: string): Promise<void> {
    try {
      const params = {
        Bucket: this.bucket,
        Key: documentKey
      };

      await this.s3.deleteObject(params).promise();
      logger.info(`KYC document deleted successfully: ${documentKey}`);
    } catch (error) {
      logger.error('Failed to delete KYC document:', error);
      throw error;
    }
  }
} 