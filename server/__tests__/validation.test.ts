import { validateRequest, validateResponse } from '../utils/routeValidator';
import { z } from 'zod';
import { AppError } from '../utils/errors';

describe('Validation System', () => {
  describe('Request Validation', () => {
    const userSchema = z.object({
      email: z.string().email(),
      password: z.string().min(8),
      phone: z.string().regex(/^\+212\d{9}$/),
    });

    it('should validate valid request data', () => {
      const req = {
        body: {
          email: 'test@example.com',
          password: 'password123',
          phone: '+212123456789',
        },
      };

      const result = validateRequest(req, userSchema);
      expect(result).toEqual(req.body);
    });

    it('should throw error for invalid email', () => {
      const req = {
        body: {
          email: 'invalid-email',
          password: 'password123',
          phone: '+212123456789',
        },
      };

      expect(() => validateRequest(req, userSchema)).toThrow(AppError);
    });

    it('should throw error for short password', () => {
      const req = {
        body: {
          email: 'test@example.com',
          password: 'short',
          phone: '+212123456789',
        },
      };

      expect(() => validateRequest(req, userSchema)).toThrow(AppError);
    });

    it('should throw error for invalid phone number', () => {
      const req = {
        body: {
          email: 'test@example.com',
          password: 'password123',
          phone: '1234567890',
        },
      };

      expect(() => validateRequest(req, userSchema)).toThrow(AppError);
    });
  });

  describe('Response Validation', () => {
    const messageSchema = z.object({
      id: z.string(),
      content: z.string(),
      senderId: z.string(),
      timestamp: z.date(),
    });

    it('should validate valid response data', () => {
      const response = {
        id: '123',
        content: 'Hello, world!',
        senderId: 'user123',
        timestamp: new Date(),
      };

      const result = validateResponse(response, messageSchema);
      expect(result).toEqual(response);
    });

    it('should throw error for missing required field', () => {
      const response = {
        id: '123',
        content: 'Hello, world!',
        senderId: 'user123',
      };

      expect(() => validateResponse(response, messageSchema)).toThrow(AppError);
    });

    it('should throw error for invalid field type', () => {
      const response = {
        id: '123',
        content: 'Hello, world!',
        senderId: 'user123',
        timestamp: '2024-03-20', // Should be Date object
      };

      expect(() => validateResponse(response, messageSchema)).toThrow(AppError);
    });
  });

  describe('Nested Object Validation', () => {
    const addressSchema = z.object({
      street: z.string(),
      city: z.string(),
      country: z.string(),
    });

    const userSchema = z.object({
      name: z.string(),
      email: z.string().email(),
      address: addressSchema,
    });

    it('should validate nested objects', () => {
      const req = {
        body: {
          name: 'John Doe',
          email: 'john@example.com',
          address: {
            street: '123 Main St',
            city: 'Casablanca',
            country: 'Morocco',
          },
        },
      };

      const result = validateRequest(req, userSchema);
      expect(result).toEqual(req.body);
    });

    it('should throw error for invalid nested object', () => {
      const req = {
        body: {
          name: 'John Doe',
          email: 'john@example.com',
          address: {
            street: '123 Main St',
            // Missing city and country
          },
        },
      };

      expect(() => validateRequest(req, userSchema)).toThrow(AppError);
    });
  });

  describe('Array Validation', () => {
    const messageSchema = z.object({
      messages: z.array(z.object({
        id: z.string(),
        content: z.string(),
      })),
    });

    it('should validate array of objects', () => {
      const req = {
        body: {
          messages: [
            { id: '1', content: 'Hello' },
            { id: '2', content: 'World' },
          ],
        },
      };

      const result = validateRequest(req, messageSchema);
      expect(result).toEqual(req.body);
    });

    it('should throw error for invalid array item', () => {
      const req = {
        body: {
          messages: [
            { id: '1', content: 'Hello' },
            { id: '2' }, // Missing content
          ],
        },
      };

      expect(() => validateRequest(req, messageSchema)).toThrow(AppError);
    });
  });

  describe('Optional Fields', () => {
    const userSchema = z.object({
      name: z.string(),
      email: z.string().email(),
      phone: z.string().optional(),
      age: z.number().optional(),
    });

    it('should validate with optional fields', () => {
      const req = {
        body: {
          name: 'John Doe',
          email: 'john@example.com',
        },
      };

      const result = validateRequest(req, userSchema);
      expect(result).toEqual(req.body);
    });

    it('should validate with provided optional fields', () => {
      const req = {
        body: {
          name: 'John Doe',
          email: 'john@example.com',
          phone: '+212123456789',
          age: 30,
        },
      };

      const result = validateRequest(req, userSchema);
      expect(result).toEqual(req.body);
    });
  });

  describe('Custom Validation', () => {
    const passwordSchema = z.object({
      password: z.string()
        .min(8)
        .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
        .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
        .regex(/[0-9]/, 'Password must contain at least one number')
        .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
    });

    it('should validate password with all requirements', () => {
      const req = {
        body: {
          password: 'Test123!@#',
        },
      };

      const result = validateRequest(req, passwordSchema);
      expect(result).toEqual(req.body);
    });

    it('should throw error for password missing uppercase', () => {
      const req = {
        body: {
          password: 'test123!@#',
        },
      };

      expect(() => validateRequest(req, passwordSchema)).toThrow(AppError);
    });

    it('should throw error for password missing special character', () => {
      const req = {
        body: {
          password: 'Test123',
        },
      };

      expect(() => validateRequest(req, passwordSchema)).toThrow(AppError);
    });
  });
}); 