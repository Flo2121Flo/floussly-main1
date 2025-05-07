import { AppError, ErrorHandler } from '../utils/errors';
import { Request, Response } from 'express';

describe('Error Handling System', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let errorHandler: ErrorHandler;

  beforeEach(() => {
    mockRequest = {
      headers: {
        'accept-language': 'en',
      },
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    errorHandler = new ErrorHandler();
  });

  describe('AppError', () => {
    it('should create error with default status code', () => {
      const error = new AppError('Test error');
      expect(error.statusCode).toBe(500);
      expect(error.message).toBe('Test error');
    });

    it('should create error with custom status code', () => {
      const error = new AppError('Not found', 404);
      expect(error.statusCode).toBe(404);
      expect(error.message).toBe('Not found');
    });

    it('should include stack trace in development', () => {
      process.env.NODE_ENV = 'development';
      const error = new AppError('Test error');
      expect(error.stack).toBeDefined();
    });

    it('should not include stack trace in production', () => {
      process.env.NODE_ENV = 'production';
      const error = new AppError('Test error');
      expect(error.stack).toBeUndefined();
    });
  });

  describe('Error Handler', () => {
    it('should handle AppError', () => {
      const error = new AppError('Test error', 400);
      errorHandler.handle(error, mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Test error',
      });
    });

    it('should handle validation errors', () => {
      const error = new AppError('Validation failed', 422);
      errorHandler.handle(error, mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(422);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Validation failed',
      });
    });

    it('should handle authentication errors', () => {
      const error = new AppError('Unauthorized', 401);
      errorHandler.handle(error, mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Unauthorized',
      });
    });

    it('should handle unknown errors', () => {
      const error = new Error('Unknown error');
      errorHandler.handle(error, mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Internal server error',
      });
    });
  });

  describe('Error Translation', () => {
    it('should translate error message to French', () => {
      mockRequest.headers = {
        'accept-language': 'fr',
      };

      const error = new AppError('User not found', 404);
      errorHandler.handle(error, mockRequest as Request, mockResponse as Response);

      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Utilisateur non trouvé',
      });
    });

    it('should translate error message to Arabic', () => {
      mockRequest.headers = {
        'accept-language': 'ar',
      };

      const error = new AppError('Invalid password', 400);
      errorHandler.handle(error, mockRequest as Request, mockResponse as Response);

      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'كلمة المرور غير صالحة',
      });
    });

    it('should use English for unknown language', () => {
      mockRequest.headers = {
        'accept-language': 'unknown',
      };

      const error = new AppError('Test error', 500);
      errorHandler.handle(error, mockRequest as Request, mockResponse as Response);

      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Test error',
      });
    });
  });

  describe('Error Logging', () => {
    it('should log error in development', () => {
      process.env.NODE_ENV = 'development';
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      const error = new AppError('Test error');
      errorHandler.handle(error, mockRequest as Request, mockResponse as Response);

      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    it('should not log error in production', () => {
      process.env.NODE_ENV = 'production';
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      const error = new AppError('Test error');
      errorHandler.handle(error, mockRequest as Request, mockResponse as Response);

      expect(consoleSpy).not.toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe('Error Response Format', () => {
    it('should include error code in response', () => {
      const error = new AppError('Test error', 400, 'INVALID_INPUT');
      errorHandler.handle(error, mockRequest as Request, mockResponse as Response);

      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Test error',
        code: 'INVALID_INPUT',
      });
    });

    it('should include validation errors in response', () => {
      const error = new AppError('Validation failed', 422, 'VALIDATION_ERROR', {
        field: 'email',
        message: 'Invalid email format',
      });
      errorHandler.handle(error, mockRequest as Request, mockResponse as Response);

      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Validation failed',
        code: 'VALIDATION_ERROR',
        errors: {
          field: 'email',
          message: 'Invalid email format',
        },
      });
    });
  });
}); 