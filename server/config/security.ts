import { config } from "./index";

export const securityConfig = {
  // Redis configuration
  redis: {
    url: process.env.REDIS_URL || "redis://localhost:6379",
  },

  // AWS configuration
  aws: {
    region: process.env.AWS_REGION || "us-east-1",
    kms: {
      keyId: process.env.KMS_KEY_ID,
    },
  },

  // Rate limiting configuration
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    blockDuration: 60 * 60, // 1 hour block after exceeding limit
    message: "Too many requests, please try again later",
  },

  // JWT configuration
  jwt: {
    accessToken: {
      secret: process.env.JWT_ACCESS_SECRET || "your-access-secret",
      expiresIn: "15m",
      algorithm: "HS256",
    },
    refreshToken: {
      secret: process.env.JWT_REFRESH_SECRET || "your-refresh-secret",
      expiresIn: "7d",
      algorithm: "HS256",
    },
    rotation: {
      enabled: true,
      interval: 24 * 60 * 60, // 24 hours
    },
  },

  // Password configuration
  password: {
    minLength: 12,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: true,
    maxAge: 90 * 24 * 60 * 60, // 90 days
    historySize: 5, // Remember last 5 passwords
  },

  // Session configuration
  session: {
    maxConcurrent: 3,
    idleTimeout: 30 * 60, // 30 minutes
    absoluteTimeout: 24 * 60 * 60, // 24 hours
  },

  // API key configuration
  apiKey: {
    length: 32,
    prefix: "fl_",
    expiration: 365 * 24 * 60 * 60, // 1 year
    maxKeysPerUser: 5,
  },

  // Encryption configuration
  encryption: {
    algorithm: "aes-256-gcm",
    keyRotation: {
      enabled: true,
      interval: 30 * 24 * 60 * 60, // 30 days
    },
    kms: {
      region: config.aws.region,
      keyId: process.env.KMS_KEY_ID,
    },
  },

  // CORS configuration
  cors: {
    allowedOrigins: [
      "https://app.floussly.com",
      "https://admin.floussly.com",
      "https://api.floussly.com",
    ],
    allowedMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Requested-With",
      "X-API-Key",
      "X-Device-Fingerprint",
    ],
    exposedHeaders: ["X-Rate-Limit-Remaining", "X-Rate-Limit-Reset"],
    maxAge: 86400, // 24 hours
    credentials: true,
  },

  // Content Security Policy
  csp: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.floussly.com"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://cdn.floussly.com"],
      imgSrc: ["'self'", "data:", "https://cdn.floussly.com"],
      connectSrc: ["'self'", "https://api.floussly.com"],
      fontSrc: ["'self'", "https://cdn.floussly.com"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
      formAction: ["'self'"],
      upgradeInsecureRequests: true,
    },
  },

  // Security headers
  headers: {
    hsts: {
      maxAge: 31536000, // 1 year
      includeSubDomains: true,
      preload: true,
    },
    xssProtection: {
      enabled: true,
      mode: "block",
    },
    frameGuard: {
      action: "deny",
    },
  },

  // Audit logging
  audit: {
    enabled: true,
    retention: 90 * 24 * 60 * 60, // 90 days
    sensitiveFields: [
      "password",
      "token",
      "apiKey",
      "creditCard",
      "ssn",
      "phone",
      "email",
    ],
  },

  // Fraud detection
  fraud: {
    maxFailedLogins: 5,
    lockoutDuration: 30 * 60, // 30 minutes
    maxTransactionsPerHour: 10,
    maxAmountPerTransaction: 10000,
    requireVerification: {
      newDevice: true,
      unusualAmount: true,
      unusualLocation: true,
      unusualTime: true,
    },
  },

  // File upload security
  fileUpload: {
    maxSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: ["image/jpeg", "image/png", "application/pdf"],
    scanForMalware: true,
    validateContent: true,
  },

  // Database security
  database: {
    connectionLimit: 10,
    idleTimeout: 60000, // 1 minute
    maxQueryTime: 5000, // 5 seconds
    backupFrequency: 24 * 60 * 60, // 24 hours
  },

  // Cache security
  cache: {
    ttl: 300, // 5 minutes
    maxSize: 1000,
    encryption: {
      enabled: true,
      algorithm: "aes-256-gcm",
    },
  },

  // Monitoring and alerts
  monitoring: {
    enabled: true,
    logLevel: "info",
    alertThresholds: {
      failedLogins: 5,
      suspiciousTransactions: 3,
      apiErrors: 100,
      highLatency: 1000, // 1 second
    },
    eventThresholds: {
      FAILED_LOGIN: 5,
      SUSPICIOUS_TRANSACTION: 3,
      API_ABUSE: 100,
      GEOGRAPHIC_ANOMALY: 1,
      RAPID_IP_CHANGES: 3,
    },
  },
}; 