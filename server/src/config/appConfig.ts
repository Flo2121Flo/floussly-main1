import { z } from 'zod';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Define configuration schema with validation
const configSchema = z.object({
  // App Settings
  NODE_ENV: z.enum(['development', 'staging', 'production']),
  APP_NAME: z.string(),
  APP_VERSION: z.string(),
  API_VERSION: z.string(),
  
  // Security
  JWT_SECRET: z.string().min(32),
  JWT_EXPIRY: z.string(),
  MFA_REQUIRED: z.boolean(),
  BIOMETRIC_ENABLED: z.boolean(),
  PASSWORD_MIN_LENGTH: z.number().min(8),
  MAX_LOGIN_ATTEMPTS: z.number().min(3),
  
  // Compliance
  KYC_REQUIRED: z.boolean(),
  KYC_LEVELS: z.array(z.object({
    level: z.number(),
    maxTransactionAmount: z.number(),
    requiredDocuments: z.array(z.string())
  })),
  AML_CHECK_ENABLED: z.boolean(),
  TRANSACTION_LIMITS: z.object({
    daily: z.number(),
    monthly: z.number(),
    perTransaction: z.number()
  }),
  
  // Storage
  S3_BUCKET: z.string(),
  S3_REGION: z.string(),
  REDIS_URL: z.string(),
  DATABASE_URL: z.string(),
  
  // Monitoring
  SENTRY_DSN: z.string().optional(),
  NEW_RELIC_LICENSE_KEY: z.string().optional(),
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']),
  
  // Mobile App
  APP_STORE_ID: z.string(),
  PLAY_STORE_ID: z.string(),
  DEEP_LINK_SCHEME: z.string(),
  APPLE_TEAM_ID: z.string(),
  
  // Notifications
  FIREBASE_PROJECT_ID: z.string(),
  FIREBASE_PRIVATE_KEY: z.string(),
  FIREBASE_CLIENT_EMAIL: z.string(),
  
  // Feature Flags
  FEATURES: z.object({
    treasureDrop: z.boolean(),
    agentSystem: z.boolean(),
    qrPayments: z.boolean(),
    internationalTransfers: z.boolean()
  })
});

// Default configuration
const defaultConfig = {
  NODE_ENV: 'development',
  APP_NAME: 'Floussly',
  APP_VERSION: '1.0.0',
  API_VERSION: 'v1',
  MFA_REQUIRED: true,
  BIOMETRIC_ENABLED: true,
  PASSWORD_MIN_LENGTH: 8,
  MAX_LOGIN_ATTEMPTS: 5,
  KYC_REQUIRED: true,
  KYC_LEVELS: [
    {
      level: 1,
      maxTransactionAmount: 1000,
      requiredDocuments: ['ID']
    },
    {
      level: 2,
      maxTransactionAmount: 5000,
      requiredDocuments: ['ID', 'ProofOfAddress']
    },
    {
      level: 3,
      maxTransactionAmount: 10000,
      requiredDocuments: ['ID', 'ProofOfAddress', 'IncomeProof']
    }
  ],
  AML_CHECK_ENABLED: true,
  TRANSACTION_LIMITS: {
    daily: 10000,
    monthly: 50000,
    perTransaction: 5000
  },
  LOG_LEVEL: 'info',
  FEATURES: {
    treasureDrop: true,
    agentSystem: true,
    qrPayments: true,
    internationalTransfers: false
  }
};

// Parse and validate configuration
const parseConfig = () => {
  try {
    const config = {
      ...defaultConfig,
      ...process.env
    };
    
    return configSchema.parse(config);
  } catch (error) {
    console.error('Configuration validation failed:', error);
    process.exit(1);
  }
};

// Export validated configuration
export const config = parseConfig();

// Export type for TypeScript
export type AppConfig = z.infer<typeof configSchema>;

// Helper functions
export const isProduction = () => config.NODE_ENV === 'production';
export const isStaging = () => config.NODE_ENV === 'staging';
export const isDevelopment = () => config.NODE_ENV === 'development';

export const getKycLevel = (userId: string) => {
  // TODO: Implement KYC level retrieval from database
  return 1;
};

export const getTransactionLimit = (userId: string) => {
  const kycLevel = getKycLevel(userId);
  const levelConfig = config.KYC_LEVELS.find(l => l.level === kycLevel);
  return levelConfig?.maxTransactionAmount || 0;
};

export const isFeatureEnabled = (feature: keyof typeof config.FEATURES) => {
  return config.FEATURES[feature];
}; 