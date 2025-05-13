import { S3 } from 'aws-sdk';
import { createReadStream } from 'fs';
import { Readable } from 'stream';
import { promisify } from 'util';
import { exec } from 'child_process';
import { logger } from '../utils/logger';
import { redis } from '../config/redis';

const execAsync = promisify(exec);
const s3 = new S3();

interface ValidationResult {
  isValid: boolean;
  errors: string[];
  mimeType: string;
  fileSize: number;
  virusScanResult?: {
    infected: boolean;
    virusName?: string;
  };
}

export class FileValidationService {
  private static instance: FileValidationService;
  private readonly allowedMimeTypes: Set<string>;
  private readonly maxFileSize: number;

  private constructor() {
    this.allowedMimeTypes = new Set([
      'application/pdf',
      'image/jpeg',
      'image/png',
      'image/jpg'
    ]);
    this.maxFileSize = 10 * 1024 * 1024; // 10MB
  }

  public static getInstance(): FileValidationService {
    if (!FileValidationService.instance) {
      FileValidationService.instance = new FileValidationService();
    }
    return FileValidationService.instance;
  }

  public async validateFile(
    fileStream: Readable,
    fileName: string,
    fileSize: number
  ): Promise<ValidationResult> {
    const errors: string[] = [];
    let mimeType = '';

    try {
      // Check file size
      if (fileSize > this.maxFileSize) {
        errors.push(`File size exceeds maximum limit of ${this.maxFileSize / 1024 / 1024}MB`);
      }

      // Detect MIME type
      mimeType = await this.detectMimeType(fileStream);
      if (!this.allowedMimeTypes.has(mimeType)) {
        errors.push(`File type ${mimeType} is not allowed`);
      }

      // Scan for viruses
      const virusScanResult = await this.scanForViruses(fileStream);
      if (virusScanResult.infected) {
        errors.push(`File is infected with ${virusScanResult.virusName}`);
      }

      // Check for malicious content
      const hasMaliciousContent = await this.checkForMaliciousContent(fileStream);
      if (hasMaliciousContent) {
        errors.push('File contains potentially malicious content');
      }

      // Validate file structure
      const structureValidation = await this.validateFileStructure(fileStream, mimeType);
      if (!structureValidation.isValid) {
        errors.push(...structureValidation.errors);
      }

      return {
        isValid: errors.length === 0,
        errors,
        mimeType,
        fileSize,
        virusScanResult
      };
    } catch (error) {
      logger.error('File validation error', {
        error: error.message,
        fileName,
        fileSize
      });

      throw new Error('File validation failed');
    }
  }

  private async detectMimeType(fileStream: Readable): Promise<string> {
    try {
      const { stdout } = await execAsync('file --mime-type -');
      return stdout.trim();
    } catch (error) {
      logger.error('MIME type detection error', { error: error.message });
      throw new Error('Failed to detect file type');
    }
  }

  private async scanForViruses(fileStream: Readable): Promise<{ infected: boolean; virusName?: string }> {
    try {
      // Use ClamAV for virus scanning
      const { stdout } = await execAsync('clamscan --stdout');
      const result = stdout.trim();

      if (result.includes('FOUND')) {
        const virusName = result.split(':')[1].trim();
        return { infected: true, virusName };
      }

      return { infected: false };
    } catch (error) {
      logger.error('Virus scan error', { error: error.message });
      throw new Error('Virus scan failed');
    }
  }

  private async checkForMaliciousContent(fileStream: Readable): Promise<boolean> {
    try {
      // Check for common malicious patterns
      const maliciousPatterns = [
        /<script.*?>.*?<\/script>/i,
        /javascript:/i,
        /data:/i,
        /vbscript:/i,
        /onload=/i,
        /onerror=/i
      ];

      const content = await this.streamToString(fileStream);
      return maliciousPatterns.some(pattern => pattern.test(content));
    } catch (error) {
      logger.error('Malicious content check error', { error: error.message });
      throw new Error('Content validation failed');
    }
  }

  private async validateFileStructure(
    fileStream: Readable,
    mimeType: string
  ): Promise<{ isValid: boolean; errors: string[] }> {
    const errors: string[] = [];

    try {
      switch (mimeType) {
        case 'application/pdf':
          // Validate PDF structure
          const pdfValidation = await this.validatePDF(fileStream);
          if (!pdfValidation.isValid) {
            errors.push(...pdfValidation.errors);
          }
          break;

        case 'image/jpeg':
        case 'image/png':
        case 'image/jpg':
          // Validate image structure
          const imageValidation = await this.validateImage(fileStream);
          if (!imageValidation.isValid) {
            errors.push(...imageValidation.errors);
          }
          break;

        default:
          errors.push('Unsupported file type for structure validation');
      }

      return { isValid: errors.length === 0, errors };
    } catch (error) {
      logger.error('File structure validation error', { error: error.message });
      throw new Error('Structure validation failed');
    }
  }

  private async validatePDF(fileStream: Readable): Promise<{ isValid: boolean; errors: string[] }> {
    const errors: string[] = [];

    try {
      // Check PDF structure using pdf-lib or similar
      const { PDFDocument } = await import('pdf-lib');
      const pdfBytes = await this.streamToBuffer(fileStream);
      const pdfDoc = await PDFDocument.load(pdfBytes);

      // Validate PDF structure
      if (!pdfDoc.getPages().length) {
        errors.push('PDF has no pages');
      }

      // Check for embedded JavaScript
      if (pdfDoc.getJavaScript()) {
        errors.push('PDF contains embedded JavaScript');
      }

      return { isValid: errors.length === 0, errors };
    } catch (error) {
      logger.error('PDF validation error', { error: error.message });
      throw new Error('PDF validation failed');
    }
  }

  private async validateImage(fileStream: Readable): Promise<{ isValid: boolean; errors: string[] }> {
    const errors: string[] = [];

    try {
      // Use sharp for image validation
      const sharp = await import('sharp');
      const image = sharp(await this.streamToBuffer(fileStream));

      // Get image metadata
      const metadata = await image.metadata();

      // Validate image dimensions
      if (metadata.width && metadata.width > 4096) {
        errors.push('Image width exceeds maximum limit');
      }
      if (metadata.height && metadata.height > 4096) {
        errors.push('Image height exceeds maximum limit');
      }

      // Check for EXIF data
      if (metadata.exif) {
        errors.push('Image contains EXIF data');
      }

      return { isValid: errors.length === 0, errors };
    } catch (error) {
      logger.error('Image validation error', { error: error.message });
      throw new Error('Image validation failed');
    }
  }

  private async streamToString(stream: Readable): Promise<string> {
    const chunks: Buffer[] = [];
    return new Promise((resolve, reject) => {
      stream.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
      stream.on('error', (err) => reject(err));
      stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    });
  }

  private async streamToBuffer(stream: Readable): Promise<Buffer> {
    const chunks: Buffer[] = [];
    return new Promise((resolve, reject) => {
      stream.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
      stream.on('error', (err) => reject(err));
      stream.on('end', () => resolve(Buffer.concat(chunks)));
    });
  }
} 