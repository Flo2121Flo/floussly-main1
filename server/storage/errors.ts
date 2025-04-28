export class StorageError extends Error {
  constructor(
    message: string,
    public code: string,
    public status: number = 500
  ) {
    super(message);
    this.name = 'StorageError';
  }
}

export const ERRORS = {
  FILE_TOO_LARGE: new StorageError(
    'File size exceeds the maximum allowed limit',
    'FILE_TOO_LARGE',
    413
  ),
  INVALID_MIME_TYPE: new StorageError(
    'File type is not allowed',
    'INVALID_MIME_TYPE',
    415
  ),
  UPLOAD_FAILED: new StorageError(
    'Failed to upload file',
    'UPLOAD_FAILED',
    500
  ),
  FILE_NOT_FOUND: new StorageError(
    'File not found',
    'FILE_NOT_FOUND',
    404
  ),
  DELETE_FAILED: new StorageError(
    'Failed to delete file',
    'DELETE_FAILED',
    500
  ),
  INVALID_PATH: new StorageError(
    'Invalid file path',
    'INVALID_PATH',
    400
  ),
  STORAGE_ERROR: new StorageError(
    'Storage service error',
    'STORAGE_ERROR',
    500
  )
}; 