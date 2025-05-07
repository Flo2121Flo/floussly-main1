import { Logger } from '../utils/logger';
import { AppError } from '../utils/errors';
import * as winston from 'winston';

describe('Logging System', () => {
  let logger: Logger;
  let consoleSpy: jest.SpyInstance;
  let fileSpy: jest.SpyInstance;

  beforeEach(() => {
    consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    fileSpy = jest.spyOn(winston.transports.File.prototype, 'log').mockImplementation();
    logger = new Logger();
  });

  afterEach(() => {
    consoleSpy.mockRestore();
    fileSpy.mockRestore();
  });

  describe('Log Levels', () => {
    it('should log info messages', () => {
      const message = 'Test info message';
      logger.info(message);

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('INFO'),
        expect.stringContaining(message)
      );
    });

    it('should log error messages', () => {
      const error = new Error('Test error');
      logger.error(error);

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('ERROR'),
        expect.stringContaining(error.message)
      );
    });

    it('should log warning messages', () => {
      const message = 'Test warning message';
      logger.warn(message);

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('WARN'),
        expect.stringContaining(message)
      );
    });

    it('should log debug messages', () => {
      const message = 'Test debug message';
      logger.debug(message);

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('DEBUG'),
        expect.stringContaining(message)
      );
    });
  });

  describe('Error Logging', () => {
    it('should log AppError with details', () => {
      const error = new AppError('Test error', 400, 'TEST_ERROR');
      logger.error(error);

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('ERROR'),
        expect.stringContaining('TEST_ERROR'),
        expect.stringContaining('400')
      );
    });

    it('should log error stack trace in development', () => {
      process.env.NODE_ENV = 'development';
      const error = new Error('Test error');
      logger.error(error);

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('ERROR'),
        expect.stringContaining(error.stack!)
      );
    });

    it('should not log error stack trace in production', () => {
      process.env.NODE_ENV = 'production';
      const error = new Error('Test error');
      logger.error(error);

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('ERROR'),
        expect.not.stringContaining(error.stack!)
      );
    });
  });

  describe('Request Logging', () => {
    it('should log HTTP request details', () => {
      const req = {
        method: 'POST',
        url: '/api/users',
        headers: {
          'user-agent': 'test-agent',
          'x-request-id': '123',
        },
        body: {
          email: 'test@example.com',
        },
      };

      logger.logRequest(req);

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('INFO'),
        expect.stringContaining('POST'),
        expect.stringContaining('/api/users')
      );
    });

    it('should log HTTP response details', () => {
      const res = {
        statusCode: 200,
        responseTime: 100,
      };

      logger.logResponse(res);

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('INFO'),
        expect.stringContaining('200'),
        expect.stringContaining('100ms')
      );
    });
  });

  describe('File Logging', () => {
    it('should write logs to file', () => {
      const message = 'Test file log message';
      logger.info(message);

      expect(fileSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          level: 'info',
          message: expect.stringContaining(message),
        })
      );
    });

    it('should rotate log files', () => {
      const rotateSpy = jest.spyOn(winston.transports.File.prototype, 'rotate').mockImplementation();
      
      // Simulate log file size exceeding limit
      for (let i = 0; i < 1000; i++) {
        logger.info('Test message');
      }

      expect(rotateSpy).toHaveBeenCalled();
      rotateSpy.mockRestore();
    });
  });

  describe('Performance Logging', () => {
    it('should log performance metrics', () => {
      const metrics = {
        responseTime: 100,
        memoryUsage: 1024,
        cpuUsage: 50,
      };

      logger.logPerformance(metrics);

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('INFO'),
        expect.stringContaining('100ms'),
        expect.stringContaining('1024'),
        expect.stringContaining('50%')
      );
    });

    it('should log slow queries', () => {
      const query = {
        sql: 'SELECT * FROM users',
        duration: 1000,
      };

      logger.logSlowQuery(query);

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('WARN'),
        expect.stringContaining('Slow Query'),
        expect.stringContaining('1000ms')
      );
    });
  });

  describe('Log Formatting', () => {
    it('should format log messages with timestamp', () => {
      const message = 'Test message';
      logger.info(message);

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringMatching(/\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}/),
        expect.stringContaining(message)
      );
    });

    it('should format log messages with request ID', () => {
      const requestId = '123';
      logger.setRequestId(requestId);
      logger.info('Test message');

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining(requestId)
      );
    });

    it('should format log messages with user ID', () => {
      const userId = 'user123';
      logger.setUserId(userId);
      logger.info('Test message');

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining(userId)
      );
    });
  });
}); 