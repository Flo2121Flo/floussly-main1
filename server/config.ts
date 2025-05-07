import dotenv from 'dotenv';
import { z } from 'zod';

// Load environment variables
dotenv.config();

// Configuration schema validation
const configSchema = z.object({
  // Server
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().transform(Number).default('3000'),
  
  // Database
  DATABASE_URL: z.string(),
  
  // AWS
  AWS_REGION: z.string(),
  AWS_ACCESS_KEY_ID: z.string(),
  AWS_SECRET_ACCESS_KEY: z.string(),
  
  // Cognito
  COGNITO_USER_POOL_ID: z.string(),
  COGNITO_CLIENT_ID: z.string(),
  
  // KMS
  KMS_KEY_ID: z.string(),
  
  // S3
  S3_BUCKET_NAME: z.string(),
  
  // Redis
  REDIS_URL: z.string(),
  
  // JWT
  JWT_SECRET: z.string(),
  JWT_EXPIRES_IN: z.string().default('1d'),
  
  // Security
  RATE_LIMIT_WINDOW_MS: z.string().transform(Number).default('900000'), // 15 minutes
  RATE_LIMIT_MAX_REQUESTS: z.string().transform(Number).default('100'),
  
  // Fees
  WITHDRAWAL_FEE_FLAT: z.string().transform(Number).default('5'),
  WITHDRAWAL_FEE_PERCENTAGE: z.string().transform(Number).default('1'),
  TONTINE_FEE_PER_USER: z.string().transform(Number).default('2'),
  TONTINE_FEE_PERCENTAGE: z.string().transform(Number).default('0.5'),
  
  // Agent
  AGENT_COMMISSION_RATE: z.string().transform(Number).default('5'),
  AGENT_MIN_WITHDRAWAL: z.string().transform(Number).default('100'),
  
  // Messaging
  MESSAGE_EXPIRY_DAYS: z.string().transform(Number).default('30'),
  MAX_MESSAGE_SIZE: z.string().transform(Number).default('10485760'), // 10MB
  
  // Tontine
  MAX_TONTINE_MEMBERS: z.string().transform(Number).default('50'),
  MIN_TONTINE_CONTRIBUTION: z.string().transform(Number).default('100'),
  
  // Limits
  MAX_WALLET_BALANCE: z.string().transform(Number).default('100000'),
  MAX_TRANSACTION_AMOUNT: z.string().transform(Number).default('50000'),
  DAILY_TRANSACTION_LIMIT: z.string().transform(Number).default('100000'),
});

// Parse and validate configuration
const config = configSchema.parse(process.env);

// Export configuration
export default {
  // Server
  env: config.NODE_ENV,
  port: config.PORT,
  isProduction: config.NODE_ENV === 'production',
  
  // Database
  database: {
    url: config.DATABASE_URL,
  },
  
  // AWS
  aws: {
    region: config.AWS_REGION,
    credentials: {
      accessKeyId: config.AWS_ACCESS_KEY_ID,
      secretAccessKey: config.AWS_SECRET_ACCESS_KEY,
    },
  },
  
  // Cognito
  cognito: {
    userPoolId: config.COGNITO_USER_POOL_ID,
    clientId: config.COGNITO_CLIENT_ID,
  },
  
  // KMS
  kms: {
    keyId: config.KMS_KEY_ID,
  },
  
  // S3
  s3: {
    bucketName: config.S3_BUCKET_NAME,
  },
  
  // Redis
  redis: {
    url: config.REDIS_URL,
  },
  
  // JWT
  jwt: {
    secret: config.JWT_SECRET,
    expiresIn: config.JWT_EXPIRES_IN,
  },
  
  // Security
  security: {
    rateLimit: {
      windowMs: config.RATE_LIMIT_WINDOW_MS,
      max: config.RATE_LIMIT_MAX_REQUESTS,
    },
  },
  
  // Fees
  fees: {
    withdrawal: {
      flat: config.WITHDRAWAL_FEE_FLAT,
      percentage: config.WITHDRAWAL_FEE_PERCENTAGE,
    },
    tontine: {
      perUser: config.TONTINE_FEE_PER_USER,
      percentage: config.TONTINE_FEE_PERCENTAGE,
    },
  },
  
  // Agent
  agent: {
    commissionRate: config.AGENT_COMMISSION_RATE,
    minWithdrawal: config.AGENT_MIN_WITHDRAWAL,
  },
  
  // Messaging
  messaging: {
    expiryDays: config.MESSAGE_EXPIRY_DAYS,
    maxSize: config.MAX_MESSAGE_SIZE,
  },
  
  // Tontine
  tontine: {
    maxMembers: config.MAX_TONTINE_MEMBERS,
    minContribution: config.MIN_TONTINE_CONTRIBUTION,
  },
  
  // Limits
  limits: {
    maxWalletBalance: config.MAX_WALLET_BALANCE,
    maxTransactionAmount: config.MAX_TRANSACTION_AMOUNT,
    dailyTransactionLimit: config.DAILY_TRANSACTION_LIMIT,
  },
} as const; 