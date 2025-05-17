import { z } from 'zod';
import { config } from './appConfig';
import { logger } from '../utils/logger';

// Security validation schemas
export const securitySchemas = {
  // User input validation
  userInput: z.object({
    email: z.string().email().max(255),
    password: z.string().min(12).max(100),
    name: z.string().min(2).max(100),
    phone: z.string().regex(/^\+?[1-9]\d{1,14}$/),
  }),

  // Transaction validation
  transaction: z.object({
    amount: z.number().positive().max(1000000),
    currency: z.enum(['USD', 'EUR', 'MAD']),
    recipientId: z.string().uuid(),
    description: z.string().max(255).optional(),
  }),

  // KYC document validation
  kycDocument: z.object({
    type: z.enum(['ID', 'PASSPORT', 'DRIVERS_LICENSE']),
    number: z.string().min(5).max(50),
    expiryDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    country: z.string().length(2),
  }),
};

// Security configuration
export const securityConfig = {
  // JWT configuration
  jwt: {
    algorithm: 'HS256',
    secret: config.JWT_SECRET,
    expiresIn: '1h',
    refreshExpiresIn: '7d',
    blacklistEnabled: true,
  },

  // CORS configuration
  cors: {
    origin: process.env.NODE_ENV === 'production' 
      ? ['https://app.floussly.com', 'https://admin.floussly.com']
      : ['http://localhost:3000', 'http://localhost:3001'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token'],
    credentials: true,
    maxAge: 86400, // 24 hours
  },

  // Rate limiting
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later',
  },

  // File upload security
  fileUpload: {
    maxSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: ['image/jpeg', 'image/png', 'application/pdf'],
    scanVirus: true,
    validateMimeType: true,
  },

  // Audit logging
  audit: {
    enabled: true,
    storage: 's3',
    bucket: 'floussly-audit-logs',
    retention: 365, // days
    sensitiveFields: ['password', 'token', 'secret'],
  },

  // Role-based access control
  rbac: {
    roles: ['user', 'agent', 'admin', 'compliance'],
    permissions: {
      user: ['read:own', 'write:own'],
      agent: ['read:own', 'write:own', 'read:clients'],
      admin: ['read:all', 'write:all'],
      compliance: ['read:all', 'write:kyc'],
    },
  },

  // Security headers
  headers: {
    'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline';",
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
  },

  // Input validation
  validation: {
    maxStringLength: 1000,
    maxArrayLength: 100,
    maxObjectDepth: 5,
    maxPayloadSize: 1024 * 1024, // 1MB
  },

  // Error handling
  errorHandling: {
    hideStackTraces: process.env.NODE_ENV === 'production',
    logErrors: true,
    notifyOnError: true,
  },
};

// Security middleware configuration
export const securityMiddleware = {
  // Request validation
  validateRequest: (schema: z.ZodSchema) => async (req: any, res: any, next: any) => {
    try {
      await schema.parseAsync(req.body);
      next();
    } catch (error) {
      logger.warn('Request validation failed', { error: error.message });
      res.status(400).json({ error: 'Invalid request data' });
    }
  },

  // Role-based access control
  checkRole: (roles: string[]) => (req: any, res: any, next: any) => {
    if (!req.user || !roles.includes(req.user.role)) {
      logger.warn('Unauthorized role access attempt', { 
        userId: req.user?.id,
        requiredRoles: roles 
      });
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  },

  // Resource ownership check
  checkOwnership: (resourceType: string) => async (req: any, res: any, next: any) => {
    try {
      const resource = await req.app.locals.db[resourceType].findOne({
        where: { id: req.params.id }
      });

      if (!resource || resource.userId !== req.user.id) {
        logger.warn('Unauthorized resource access attempt', {
          userId: req.user.id,
          resourceType,
          resourceId: req.params.id
        });
        return res.status(403).json({ error: 'Access denied' });
      }

      req.resource = resource;
      next();
    } catch (error) {
      logger.error('Ownership check failed', { error: error.message });
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  // Audit logging
  auditLog: (event: string) => async (req: any, res: any, next: any) => {
    const startTime = Date.now();
    res.on('finish', () => {
      const duration = Date.now() - startTime;
      logger.info('Audit log', {
        event,
        userId: req.user?.id,
        method: req.method,
        path: req.path,
        status: res.statusCode,
        duration,
        ip: req.ip,
        userAgent: req.headers['user-agent']
      });
    });
    next();
  },
};

// Export security utilities
export const securityUtils = {
  // Sanitize user input
  sanitizeInput: (input: string): string => {
    return input
      .replace(/[<>]/g, '') // Remove HTML tags
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/on\w+="[^"]*"/g, '') // Remove event handlers
      .trim();
  },

  // Generate CSRF token
  generateCsrfToken: (): string => {
    return crypto.randomBytes(32).toString('hex');
  },

  // Validate file upload
  validateFile: async (file: Express.Multer.File): Promise<boolean> => {
    if (!file) return false;
    if (file.size > securityConfig.fileUpload.maxSize) return false;
    if (!securityConfig.fileUpload.allowedTypes.includes(file.mimetype)) return false;
    return true;
  },

  // Check for suspicious patterns
  checkSuspiciousPatterns: (data: any): boolean => {
    const patterns = [
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, // XSS
      /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|ALTER|EXEC|--)\b)/i, // SQL Injection
      /\.\.\//g, // Path Traversal
    ];

    return patterns.some(pattern => 
      JSON.stringify(data).match(pattern)
    );
  },
}; 