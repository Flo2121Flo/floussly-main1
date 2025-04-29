import { env } from "../lib/env";

export const SECURITY_CONFIG = {
  // Content Security Policy
  csp: {
    defaultSrc: ["'none'"],
    scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
    styleSrc: ["'self'", "'unsafe-inline'"],
    imgSrc: ["'self'", 'data:', 'https:'],
    fontSrc: ["'self'"],
    connectSrc: ["'self'", process.env.API_URL || 'http://localhost:3000'],
    frameAncestors: ["'none'"],
    formAction: ["'self'"],
    baseUri: ["'self'"],
    objectSrc: ["'none'"],
    mediaSrc: ["'self'"],
    frameSrc: ["'none'"],
    workerSrc: ["'self'"],
    childSrc: ["'self'"],
  },

  // CORS Configuration
  cors: {
    origin: process.env.NODE_ENV === 'production' 
      ? ['https://floussly.com', 'https://www.floussly.com']
      : ['http://localhost:3000', 'http://localhost:5173'],
    maxAge: 86400, // 24 hours
  },

  // Rate Limiting
  rateLimiting: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 100,
  },

  // Session Security
  session: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'strict',
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
  },

  // API Security
  api: {
    timeout: 30000, // 30 seconds
    retryAttempts: 3,
    retryDelay: 1000, // 1 second
  },

  // Password Policy
  password: {
    minLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: true,
    maxAge: 90, // days
  },

  // 2FA Settings
  twoFactor: {
    required: true,
    backupCodes: 5,
    recoveryWindow: 7, // days
  },

  // Audit Logging
  audit: {
    enabled: true,
    sensitiveFields: ['password', 'token', 'apiKey'],
    retentionDays: 90,
  },
} as const;

// Security middleware
export function applySecurityHeaders(req: any, res: any, next: any) {
  // Apply CSP
  const cspHeader = Object.entries(SECURITY_CONFIG.csp)
    .map(([key, value]) => `${key} ${value.join(" ")}`)
    .join("; ");

  res.setHeader("Content-Security-Policy", cspHeader);

  // Apply security headers
  Object.entries(SECURITY_CONFIG.headers).forEach(([key, value]) => {
    res.setHeader(key, value);
  });

  next();
}

// Input sanitization
export function sanitizeInput(input: string): string {
  return input
    .replace(/[<>]/g, "") // Remove HTML tags
    .replace(/javascript:/gi, "") // Remove javascript: protocol
    .replace(/on\w+="[^"]*"/g, "") // Remove event handlers
    .trim();
}

// Password validation
export function validatePassword(password: string): boolean {
  const {
    minLength,
    requireUppercase,
    requireLowercase,
    requireNumbers,
    requireSpecialChars,
  } = SECURITY_CONFIG.password;

  if (password.length < minLength) return false;
  if (requireUppercase && !/[A-Z]/.test(password)) return false;
  if (requireLowercase && !/[a-z]/.test(password)) return false;
  if (requireNumbers && !/[0-9]/.test(password)) return false;
  if (requireSpecialChars && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) return false;

  return true;
}

// Audit logging
export function logSecurityEvent(event: {
  type: string;
  userId?: string;
  ip?: string;
  details: Record<string, any>;
}) {
  if (!SECURITY_CONFIG.audit.enabled) return;

  const sanitizedDetails = Object.entries(event.details).reduce(
    (acc, [key, value]) => {
      if (SECURITY_CONFIG.audit.sensitiveFields.includes(key)) {
        acc[key] = "[REDACTED]";
      } else {
        acc[key] = value;
      }
      return acc;
    },
    {} as Record<string, any>
  );

  console.log("[SECURITY]", {
    timestamp: new Date().toISOString(),
    ...event,
    details: sanitizedDetails,
  });
} 