import { Request, Response, NextFunction } from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import cors from "cors";
import { securityConfig } from "../config/security";
import { logger, logSecurityEvent } from "../utils/logger";
import { RateLimitError } from "../utils/error";
import { Redis } from "ioredis";
import sanitizeHtml from "sanitize-html";
import { escape } from "html-escaper";
import { KMS } from "aws-sdk";
import { createHash, randomBytes } from "crypto";
import { verify } from "jsonwebtoken";
import { promisify } from "util";
import { AWSError } from "aws-sdk";
import securityService from '../services/security';
import crypto from 'crypto';
import config from '../config';

// Install required type definitions
// npm install --save-dev @types/sanitize-html @types/html-escaper @types/jsonwebtoken

// Type definitions
interface CognitoUser {
  sub: string;
  email: string;
  phoneNumber?: string;
  groups?: string[];
}

interface RequestWithUser extends Request {
  user?: CognitoUser;
}

const redis = new Redis(securityConfig.redis.url);
const kms = new KMS({ region: securityConfig.aws.region });

// Advanced rate limiting with Redis store and IP-based blocking
export const rateLimiter = rateLimit({
  store: {
    incr: async (key) => {
      const count = await redis.incr(key);
      await redis.expire(key, Math.floor(securityConfig.rateLimit.windowMs / 1000));
      
      // Block IP if too many failed attempts
      if (count > securityConfig.rateLimit.max * 2) {
        const blockKey = `blocked:${key}`;
        await redis.set(blockKey, "1", "EX", securityConfig.rateLimit.blockDuration);
        logSecurityEvent("IP_BLOCKED", { 
          ip: key,
          count,
          threshold: securityConfig.rateLimit.max * 2
        });
      }
      
      return count;
    },
    decrement: async (key) => {
      const count = await redis.decr(key);
      if (count <= 0) {
        await redis.del(key);
      }
      return count;
    },
    resetKey: async (key) => {
      await redis.del(key);
      await redis.del(`blocked:${key}`);
    },
  },
  windowMs: securityConfig.rateLimit.windowMs,
  max: securityConfig.rateLimit.max,
  message: securityConfig.rateLimit.message,
  handler: (req: Request, res: Response) => {
    const ip = req.ip;
    const path = req.path;
    const userAgent = req.get("user-agent");
    const fingerprint = req.headers["x-device-fingerprint"];
    const userId = (req as RequestWithUser).user?.sub;

    logSecurityEvent("RATE_LIMIT_EXCEEDED", {
      ip,
      path,
      userAgent,
      fingerprint,
      userId,
      timestamp: new Date().toISOString()
    });

    throw new RateLimitError();
  },
});

// Enhanced CORS configuration with strict origin checking
export const corsMiddleware = cors({
  origin: async (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    if (!origin) {
      return callback(new Error("Origin not allowed"), false);
    }

    // Check if origin is allowed
    const allowedOrigins = securityConfig.cors.allowedOrigins;

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      logSecurityEvent("CORS_BLOCKED", { 
        origin,
        timestamp: new Date().toISOString()
      });
      callback(new Error("Not allowed by CORS"), false);
    }
  },
  methods: securityConfig.cors.allowedMethods,
  allowedHeaders: securityConfig.cors.allowedHeaders,
  exposedHeaders: securityConfig.cors.exposedHeaders,
  credentials: securityConfig.cors.credentials,
  maxAge: securityConfig.cors.maxAge,
  preflightContinue: false,
  optionsSuccessStatus: 204
});

// Origin signature verification middleware
export const verifyOriginSignatureMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  const origin = req.get("origin");
  const signature = req.headers["x-origin-signature"];

  if (origin && signature) {
    try {
      const isValid = await verifyOriginSignature(origin, signature as string);
      if (!isValid) {
        logSecurityEvent("INVALID_ORIGIN_SIGNATURE", { 
          origin,
          timestamp: new Date().toISOString()
        });
        return res.status(403).json({ error: "Invalid origin signature" });
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logSecurityEvent("ORIGIN_VERIFICATION_FAILED", { 
        origin, 
        error: errorMessage,
        timestamp: new Date().toISOString()
      });
      return res.status(403).json({ error: "Origin verification failed" });
    }
  }

  next();
};

// Enhanced Helmet configuration with strict CSP
export const helmetConfig = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https://api.floussly.com"],
      fontSrc: ["'self'", "https:", "data:"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
      baseUri: ["'self'"],
      formAction: ["'self'"],
      frameAncestors: ["'none'"],
      upgradeInsecureRequests: [],
    },
  },
  crossOriginEmbedderPolicy: true,
  crossOriginOpenerPolicy: true,
  crossOriginResourcePolicy: { policy: "same-site" },
  dnsPrefetchControl: true,
  frameguard: { action: "deny" },
  hidePoweredBy: true,
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
  ieNoOpen: true,
  noSniff: true,
  originAgentCluster: true,
  permittedCrossDomainPolicies: { permittedPolicies: "none" },
  referrerPolicy: { policy: "strict-origin-when-cross-origin" },
  xssFilter: true,
});

// Enhanced API key validation with KMS
export const validateApiKey = async (req: Request, res: Response, next: NextFunction) => {
  const apiKey = req.headers["x-api-key"];
  const requestId = req.headers["x-request-id"];

  if (!apiKey || !requestId) {
    logSecurityEvent("MISSING_API_KEY", {
      path: req.path,
      ip: req.ip,
      requestId,
    });
    return res.status(401).json({ message: "API key and request ID are required" });
  }

  try {
    // Verify API key signature using KMS
    const isValid = await verifyApiKeySignature(apiKey as string, requestId as string);
    if (!isValid) {
      logSecurityEvent("INVALID_API_KEY", {
        path: req.path,
        ip: req.ip,
        requestId,
      });
      return res.status(401).json({ message: "Invalid API key" });
    }

    // Check API key expiration
    const keyData = await redis.get(`apikey:${apiKey}`);
    if (!keyData) {
      logSecurityEvent("EXPIRED_API_KEY", {
        path: req.path,
        ip: req.ip,
        requestId,
      });
      return res.status(401).json({ message: "API key expired" });
    }

    next();
  } catch (error) {
    logSecurityEvent("API_KEY_VERIFICATION_FAILED", {
      path: req.path,
      ip: req.ip,
      requestId,
      error,
    });
    return res.status(500).json({ message: "API key verification failed" });
  }
};

// Enhanced request sanitization with advanced XSS protection
export const sanitizeRequest = (req: Request, res: Response, next: NextFunction) => {
  // Generate request ID if not present
  if (!req.headers["x-request-id"]) {
    req.headers["x-request-id"] = randomBytes(16).toString("hex");
  }

  // Sanitize request body
  if (req.body) {
    Object.keys(req.body).forEach((key) => {
      if (typeof req.body[key] === "string") {
        // Remove any potential script tags and sanitize HTML
        req.body[key] = sanitizeHtml(req.body[key], {
          allowedTags: [],
          allowedAttributes: {},
          disallowedTagsMode: "recursiveEscape",
        });
        // Escape HTML entities
        req.body[key] = escape(req.body[key]);
        // Remove any potential SQL injection attempts
        req.body[key] = req.body[key].replace(/[\0\x08\x09\x1a\n\r"'\\\%]/g, "");
        // Remove any potential command injection attempts
        req.body[key] = req.body[key].replace(/[;&|`$]/g, "");
      }
    });
  }

  // Sanitize query parameters
  if (req.query) {
    Object.keys(req.query).forEach((key) => {
      if (typeof req.query[key] === "string") {
        const value = req.query[key] as string;
        req.query[key] = sanitizeHtml(value, {
          allowedTags: [],
          allowedAttributes: {},
          disallowedTagsMode: "recursiveEscape",
        });
        req.query[key] = escape(req.query[key] as string);
        req.query[key] = (req.query[key] as string)
          .replace(/[\0\x08\x09\x1a\n\r"'\\\%]/g, "")
          .replace(/[;&|`$]/g, "");
      }
    });
  }

  // Sanitize URL parameters
  if (req.params) {
    Object.keys(req.params).forEach((key) => {
      if (typeof req.params[key] === "string") {
        req.params[key] = sanitizeHtml(req.params[key], {
          allowedTags: [],
          allowedAttributes: {},
          disallowedTagsMode: "recursiveEscape",
        });
        req.params[key] = escape(req.params[key]);
        req.params[key] = req.params[key]
          .replace(/[\0\x08\x09\x1a\n\r"'\\\%]/g, "")
          .replace(/[;&|`$]/g, "");
      }
    });
  }

  next();
};

// Enhanced request validation with schema-based validation
export const validateRequest = (schema: any) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { error } = await schema.validate(req.body, {
        abortEarly: false,
        stripUnknown: true,
      });
      
      if (error) {
        const errors = error.details.map((detail: any) => ({
          field: detail.path.join("."),
          message: detail.message,
        }));
        
        logSecurityEvent("VALIDATION_FAILED", {
          path: req.path,
          errors,
          requestId: req.headers["x-request-id"],
        });
        
        return res.status(400).json({
          status: "error",
          code: "VALIDATION_FAILED",
          errors,
        });
      }
      
      next();
    } catch (err) {
      next(err);
    }
  };
};

// Enhanced security headers
export const securityHeaders = (req: Request, res: Response, next: NextFunction) => {
  // Set security headers
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload");
  res.setHeader("Content-Security-Policy", "default-src 'self'");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("Permissions-Policy", "geolocation=(), microphone=(), camera=()");
  res.setHeader("X-DNS-Prefetch-Control", "off");
  res.setHeader("X-Download-Options", "noopen");
  res.setHeader("X-Permitted-Cross-Domain-Policies", "none");
  const requestId = req.headers["x-request-id"];
  if (requestId) {
    res.setHeader("X-Request-ID", requestId);
  }

  next();
};

// Enhanced request logging with security context
export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  const requestId = req.headers["x-request-id"] as string | undefined;
  const userId = (req as RequestWithUser).user?.sub;

  res.on("finish", () => {
    const duration = Date.now() - start;
    logger.info({
      requestId,
      method: req.method,
      path: req.path,
      status: res.statusCode,
      duration,
      ip: req.ip,
      userAgent: req.get("user-agent"),
      userId,
      deviceFingerprint: req.headers["x-device-fingerprint"],
      securityContext: {
        isAuthenticated: !!(req as RequestWithUser).user,
        hasValidApiKey: !!req.headers["x-api-key"],
        isSecureConnection: req.secure,
      },
    });
  });

  next();
};

// Enhanced error logging with security context
export const errorLogger = (err: Error, req: Request, res: Response, next: NextFunction) => {
  logger.error({
    requestId: req.headers["x-request-id"],
    error: err.message,
    stack: err.stack,
    method: req.method,
    path: req.path,
    ip: req.ip,
    userAgent: req.get("user-agent"),
    userId: (req as RequestWithUser).user?.sub,
    deviceFingerprint: req.headers["x-device-fingerprint"],
    securityContext: {
      isAuthenticated: !!(req as RequestWithUser).user,
      hasValidApiKey: !!req.headers["x-api-key"],
      isSecureConnection: req.secure,
    },
  });

  next(err);
};

// Helper functions
async function verifyApiKeySignature(apiKey: string, requestId: string): Promise<boolean> {
  try {
    if (!securityConfig.aws.kms.keyId) {
      throw new Error("KMS key ID is not configured");
    }

    const params = {
      KeyId: securityConfig.aws.kms.keyId,
      Message: Buffer.from(requestId),
      Signature: Buffer.from(apiKey, "base64"),
      SigningAlgorithm: "ECDSA_SHA_256",
    };

    await kms.verify(params).promise();
    return true;
  } catch (error) {
    return false;
  }
}

async function verifyOriginSignature(origin: string, signature: string): Promise<boolean> {
  try {
    if (!securityConfig.aws.kms.keyId) {
      throw new Error("KMS key ID is not configured");
    }

    const params = {
      KeyId: securityConfig.aws.kms.keyId,
      Message: Buffer.from(origin),
      Signature: Buffer.from(signature, "base64"),
      SigningAlgorithm: "ECDSA_SHA_256",
    };

    await kms.verify(params).promise();
    return true;
  } catch (error) {
    return false;
  }
}

// Security middleware
export const securityMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Skip security checks for non-sensitive endpoints
    if (isNonSensitiveEndpoint(req.path, req.method)) {
      return next();
    }

    // Check request security
    const securityCheck = await securityService.checkRequestSecurity(req);
    
    if (!securityCheck.isSecure) {
      logger.warn('Security check failed', {
        ip: req.ip,
        userId: req.user?.id,
        path: req.path,
        reason: securityCheck.reason,
        riskScore: securityCheck.riskScore,
      });

      return res.status(403).json({
        error: 'Access denied due to security concerns',
        code: 'SECURITY_CHECK_FAILED',
        reason: securityCheck.reason,
      });
    }

    // Add security headers
    addSecurityHeaders(res);

    // Validate request integrity
    if (!validateRequestIntegrity(req)) {
      logger.warn('Request integrity check failed', {
        ip: req.ip,
        userId: req.user?.id,
        path: req.path,
      });

      return res.status(400).json({
        error: 'Invalid request',
        code: 'REQUEST_INTEGRITY_FAILED',
      });
    }

    // Check for common attack patterns
    if (await isAttackPattern(req)) {
      logger.warn('Attack pattern detected', {
        ip: req.ip,
        userId: req.user?.id,
        path: req.path,
      });

      return res.status(403).json({
        error: 'Access denied',
        code: 'ATTACK_PATTERN_DETECTED',
      });
    }

    next();
  } catch (error) {
    logger.error('Security middleware error', { error });
    next(error);
  }
};

// Helper functions
const isNonSensitiveEndpoint = (path: string, method: string): boolean => {
  const nonSensitivePaths = [
    '/health',
    '/metrics',
    '/docs',
    '/static',
  ];
  
  return nonSensitivePaths.some(p => path.startsWith(p)) || method === 'GET';
};

const addSecurityHeaders = (res: Response): void => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  res.setHeader('Content-Security-Policy', "default-src 'self'");
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
};

const validateRequestIntegrity = (req: Request): boolean => {
  // Check for required headers
  const requiredHeaders = ['user-agent', 'x-request-id'];
  if (!requiredHeaders.every(header => req.headers[header])) {
    return false;
  }

  // Validate request ID format
  const requestId = req.headers['x-request-id'] as string;
  if (!/^[a-f0-9]{32}$/.test(requestId)) {
    return false;
  }

  // Validate content type for POST/PUT requests
  if (['POST', 'PUT'].includes(req.method)) {
    const contentType = req.headers['content-type'];
    if (!contentType || !contentType.includes('application/json')) {
      return false;
    }
  }

  return true;
};

const isAttackPattern = async (req: Request): Promise<boolean> => {
  const ip = req.ip;
  const userId = req.user?.id;

  // Check for SQL injection patterns
  if (hasSQLInjectionPattern(req)) {
    await blockIP(ip);
    return true;
  }

  // Check for XSS patterns
  if (hasXSSPattern(req)) {
    await blockIP(ip);
    return true;
  }

  // Check for command injection patterns
  if (hasCommandInjectionPattern(req)) {
    await blockIP(ip);
    return true;
  }

  // Check for path traversal patterns
  if (hasPathTraversalPattern(req)) {
    await blockIP(ip);
    return true;
  }

  // Check for CSRF token
  if (['POST', 'PUT', 'DELETE'].includes(req.method)) {
    const csrfToken = req.headers['x-csrf-token'];
    if (!csrfToken || !await validateCSRFToken(csrfToken as string, userId)) {
      return true;
    }
  }

  return false;
};

const hasSQLInjectionPattern = (req: Request): boolean => {
  const sqlPatterns = [
    /(\%27)|(\')|(\-\-)|(\%23)|(#)/i,
    /((\%3D)|(=))[^\n]*((\%27)|(\')|(\-\-)|(\%3B)|(;))/i,
    /\w*((\%27)|(\'))((\%6F)|o|(\%4F))((\%72)|r|(\%52))/i,
    /((\%27)|(\'))union/i,
    /exec(\s|\+)+(s|x)p\w+/i,
  ];

  const checkValue = (value: string): boolean => {
    return sqlPatterns.some(pattern => pattern.test(value));
  };

  // Check query parameters
  if (Object.values(req.query).some(value => checkValue(String(value)))) {
    return true;
  }

  // Check body parameters
  if (req.body && Object.values(req.body).some(value => checkValue(String(value)))) {
    return true;
  }

  return false;
};

const hasXSSPattern = (req: Request): boolean => {
  const xssPatterns = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
    /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
    /<img\b[^<]*(?:(?!<\/img>)<[^<]*)*<\/img>/gi,
  ];

  const checkValue = (value: string): boolean => {
    return xssPatterns.some(pattern => pattern.test(value));
  };

  // Check query parameters
  if (Object.values(req.query).some(value => checkValue(String(value)))) {
    return true;
  }

  // Check body parameters
  if (req.body && Object.values(req.body).some(value => checkValue(String(value)))) {
    return true;
  }

  return false;
};

const hasCommandInjectionPattern = (req: Request): boolean => {
  const commandPatterns = [
    /[;&|`\$]/,
    /(\b(cat|chmod|curl|wget|nc|netcat|bash|sh)\b)/i,
    /(\b(rm|cp|mv|mkdir|touch)\b)/i,
  ];

  const checkValue = (value: string): boolean => {
    return commandPatterns.some(pattern => pattern.test(value));
  };

  // Check query parameters
  if (Object.values(req.query).some(value => checkValue(String(value)))) {
    return true;
  }

  // Check body parameters
  if (req.body && Object.values(req.body).some(value => checkValue(String(value)))) {
    return true;
  }

  return false;
};

const hasPathTraversalPattern = (req: Request): boolean => {
  const pathPatterns = [
    /\.\.\//,
    /\.\.\\/,
    /\/\.\.\//,
    /\\\.\.\\/,
  ];

  const checkValue = (value: string): boolean => {
    return pathPatterns.some(pattern => pattern.test(value));
  };

  // Check query parameters
  if (Object.values(req.query).some(value => checkValue(String(value)))) {
    return true;
  }

  // Check body parameters
  if (req.body && Object.values(req.body).some(value => checkValue(String(value)))) {
    return true;
  }

  return false;
};

const validateCSRFToken = async (token: string, userId?: string): Promise<boolean> => {
  if (!userId) {
    return false;
  }

  const key = `csrf:${userId}`;
  const storedToken = await redis.get(key);

  if (!storedToken || storedToken !== token) {
    return false;
  }

  // Rotate CSRF token
  const newToken = crypto.randomBytes(32).toString('hex');
  await redis.set(key, newToken, 'EX', 3600); // 1 hour expiry

  return true;
};

const blockIP = async (ip: string): Promise<void> => {
  const key = `blocked:ip:${ip}`;
  await redis.set(key, 'true', 'EX', 3600); // 1 hour block
};

export default securityMiddleware; 