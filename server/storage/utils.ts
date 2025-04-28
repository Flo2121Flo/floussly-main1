import { createHash } from 'crypto';
import { extname } from 'path';
import { FileMetadata, StorageConfig } from './types';
import { ERRORS } from './errors';

export function generateUniqueFilename(originalName: string): string {
  const timestamp = Date.now();
  const hash = createHash('md5')
    .update(originalName + timestamp)
    .digest('hex');
  const ext = extname(originalName);
  return `${hash}${ext}`;
}

export function validateFile(file: Express.Multer.File, config: StorageConfig): void {
  if (file.size > config.maxFileSize) {
    throw ERRORS.FILE_TOO_LARGE;
  }

  if (!config.allowedMimeTypes.includes(file.mimetype)) {
    throw ERRORS.INVALID_MIME_TYPE;
  }
}

export function createFileMetadata(
  file: Express.Multer.File,
  userId: string,
  filename: string
): FileMetadata {
  return {
    id: createHash('md5').update(filename).digest('hex'),
    filename,
    originalName: file.originalname,
    mimeType: file.mimetype,
    size: file.size,
    path: filename,
    userId,
    createdAt: new Date(),
    updatedAt: new Date()
  };
}

export function sanitizePath(path: string): string {
  return path.replace(/[^a-zA-Z0-9-_./]/g, '');
} 