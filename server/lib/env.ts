import { config } from 'dotenv';
import { z } from 'zod';

// Load environment variables
config();

// Define environment variable schema
const envSchema = z.object({
  // Server Configuration
  PORT: z.string().transform(Number).default('3000'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

  // Database Configuration
  DB_HOST: z.string(),
  DB_PORT: z.string().transform(Number),
  DB_USER: z.string(),
  DB_PASSWORD: z.string(),
  DB_NAME: z.string(),
  DB_POOL_SIZE: z.string().transform(Number),
  DB_SSL: z.string().transform((val) => val === 'true'),

  // Redis Configuration
  REDIS_HOST: z.string(),
  REDIS_PORT: z.string().transform(Number),
  REDIS_PASSWORD: z.string().nullable(),

  // JWT Configuration
  JWT_SECRET: z.string().min(32),
  JWT_EXPIRES_IN: z.string(),
  JWT_REFRESH_EXPIRES_IN: z.string(),

  // AWS Configuration
  AWS_ACCESS_KEY_ID: z.string(),
  AWS_SECRET_ACCESS_KEY: z.string(),
  AWS_REGION: z.string(),
  AWS_S3_BUCKET: z.string(),

  // Payment Provider API Keys
  M2T_API_KEY: z.string(),
  M2T_SECRET_KEY: z.string(),
  CMI_API_KEY: z.string(),
  BANK_AL_MAGHRIB_API_KEY: z.string(),

  // Email Configuration
  EMAIL_HOST: z.string(),
  EMAIL_PORT: z.string().transform(Number),
  EMAIL_USER: z.string(),
  EMAIL_PASSWORD: z.string(),

  // Security Configuration
  SESSION_SECRET: z.string().min(32),
  CORS_ORIGIN: z.string(),
  RATE_LIMIT_WINDOW_MS: z.string().transform(Number),
  RATE_LIMIT_MAX_REQUESTS: z.string().transform(Number),

  // Feature Flags
  ENABLE_CRYPTO: z.string().transform((val) => val === 'true'),
  ENABLE_AML_MONITORING: z.string().transform((val) => val === 'true'),
  ENABLE_FRAUD_DETECTION: z.string().transform((val) => val === 'true'),
});

// Parse and validate environment variables
const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error('❌ Invalid environment variables:', parsedEnv.error.format());
  process.exit(1);
}

export const env = parsedEnv.data; 