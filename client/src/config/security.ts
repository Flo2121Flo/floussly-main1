import { env } from "../lib/env";
import { Request, Response, NextFunction } from 'express';
import { Platform } from 'react-native';
import * as Keychain from 'react-native-keychain';
import { getUniqueId } from 'react-native-device-info';
import { logger } from '../utils/logger';

export const securityConfig = {
  // Content Security Policy
  csp: {
    'default-src': ["'self'"],
    'script-src': [
      "'self'",
      "'unsafe-inline'",
      "'unsafe-eval'",
      'https://www.google-analytics.com',
      'https://www.googletagmanager.com',
    ],
    'style-src': [
      "'self'",
      "'unsafe-inline'",
      'https://fonts.googleapis.com',
    ],
    'img-src': [
      "'self'",
      'data:',
      'https:',
      'blob:',
    ],
    'font-src': [
      "'self'",
      'https://fonts.gstatic.com',
    ],
    'connect-src': [
      "'self'",
      'https://api.floussly.com',
      'https://www.google-analytics.com',
    ],
    'frame-src': ["'none'"],
    'object-src': ["'none'"],
    'base-uri': ["'self'"],
    'form-action': ["'self'"],
    'frame-ancestors': ["'none'"],
    'block-all-mixed-content': true,
    'upgrade-insecure-requests': true,
  },

  // Feature Policy
  featurePolicy: {
    'accelerometer': ["'none'"],
    'camera': ["'none'"],
    'geolocation': ["'none'"],
    'gyroscope': ["'none'"],
    'magnetometer': ["'none'"],
    'microphone': ["'none'"],
    'payment': ["'none'"],
    'usb': ["'none'"],
  },

  // HTTP Headers
  headers: {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  },

  // API Configuration
  api: {
    baseUrl: process.env.NEXT_PUBLIC_API_URL || 'https://api.floussly.com',
    timeout: 30000,
    retryAttempts: 3,
    retryDelay: 1000,
  },

  // Authentication
  auth: {
    tokenKey: 'auth_token',
    refreshTokenKey: 'refresh_token',
    tokenExpiryKey: 'token_expiry',
    tokenPrefix: 'Bearer',
    refreshTokenEndpoint: '/auth/refresh',
    loginEndpoint: '/auth/login',
    logoutEndpoint: '/auth/logout',
  },

  // Error Handling
  errorHandling: {
    maxRetries: 3,
    retryDelay: 1000,
    timeout: 30000,
  },

  // Logging
  logging: {
    enabled: process.env.NODE_ENV === 'development',
    level: process.env.NODE_ENV === 'development' ? 'debug' : 'error',
    maxLogSize: 5 * 1024 * 1024, // 5MB
    maxLogFiles: 5,
  },

  // Performance Monitoring
  performance: {
    enabled: true,
    sampleRate: 0.1, // 10% of users
    metrics: ['FCP', 'LCP', 'CLS', 'FID', 'TTFB'],
  },

  // Security Monitoring
  monitoring: {
    enabled: true,
    errorReporting: true,
    performanceMonitoring: true,
    userBehaviorTracking: false,
  },

  // Token storage
  tokenStorage: {
    async storeToken(token: string): Promise<void> {
      try {
        await Keychain.setGenericPassword('auth_token', token);
      } catch (error) {
        logger.error('Failed to store token', { error: error.message });
        throw error;
      }
    },
    async getToken(): Promise<string | null> {
      try {
        const credentials = await Keychain.getGenericPassword();
        return credentials ? credentials.password : null;
      } catch (error) {
        logger.error('Failed to get token', { error: error.message });
        return null;
      }
    },
    async removeToken(): Promise<void> {
      try {
        await Keychain.resetGenericPassword();
      } catch (error) {
        logger.error('Failed to remove token', { error: error.message });
        throw error;
      }
    }
  },

  // Device fingerprinting
  deviceFingerprint: {
    async getFingerprint(): Promise<string> {
      try {
        const deviceId = await getUniqueId();
        return deviceId;
      } catch (error) {
        logger.error('Failed to get device fingerprint', { error: error.message });
        throw error;
      }
    }
  },

  // Biometric authentication
  biometric: {
    async isAvailable(): Promise<boolean> {
      try {
        const biometryType = await Keychain.getSupportedBiometryType();
        return biometryType !== null;
      } catch (error) {
        logger.error('Failed to check biometric availability', { error: error.message });
        return false;
      }
    },
    async authenticate(): Promise<boolean> {
      try {
        const result = await Keychain.authenticate('Authenticate to continue');
        return result;
      } catch (error) {
        logger.error('Biometric authentication failed', { error: error.message });
        return false;
      }
    }
  },

  // Network security
  network: {
    sslPinning: {
      enabled: true,
      domains: ['api.floussly.com'],
      publicKeys: [
        // Add your SSL public keys here
      ]
    },
    certificateTransparency: true,
    cleartextTraffic: false
  },

  // App security
  app: {
    jailbreakDetection: true,
    rootDetection: true,
    debuggerDetection: true,
    emulatorDetection: true,
    screenRecordingDetection: true
  },

  // Data security
  data: {
    encryption: {
      algorithm: 'AES-256-GCM',
      keySize: 256
    },
    secureStorage: {
      enabled: true,
      encryptionKey: 'your-encryption-key'
    }
  }
};

// Platform-specific security settings
export const platformSecurity = Platform.select({
  ios: {
    keychainAccessibility: Keychain.ACCESSIBLE.WHEN_UNLOCKED,
    keychainAccessControl: Keychain.ACCESS_CONTROL.BIOMETRY_ANY,
    minimumBiometryLevel: Keychain.BIOMETRY_TYPE.TOUCH_ID
  },
  android: {
    keychainAccessibility: Keychain.ACCESSIBLE.WHEN_UNLOCKED,
    keychainAccessControl: Keychain.ACCESS_CONTROL.BIOMETRY_ANY,
    minimumBiometryLevel: Keychain.BIOMETRY_TYPE.FINGERPRINT
  }
});

// Security middleware
export function applySecurityHeaders(req: Request, res: Response, next: NextFunction) {
  // Apply CSP
  const cspHeader = Object.entries(securityConfig.csp)
    .map(([key, value]) => `${key} ${value.join(" ")}`)
    .join("; ");

  res.setHeader("Content-Security-Policy", cspHeader);

  // Apply security headers
  Object.entries(securityConfig.headers).forEach(([key, value]) => {
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
  } = securityConfig.password;

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
  if (!securityConfig.audit.enabled) return;

  const sanitizedDetails = Object.entries(event.details).reduce(
    (acc, [key, value]) => {
      if (securityConfig.audit.sensitiveFields.includes(key)) {
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