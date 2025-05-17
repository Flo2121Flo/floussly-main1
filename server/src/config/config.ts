interface Config {
  NODE_ENV: 'development' | 'production' | 'staging';
  JWT_SECRET: string;
  REDIS_URL: string;
  DATABASE_URL: string;
  APP_NAME: string;
  APP_VERSION: string;
  API_VERSION: string;
  JWT_EXPIRY: string;
  PORT: number;
  LOG_LEVEL: string;
  CORS_ORIGIN: string;
  RATE_LIMIT_WINDOW: number;
  RATE_LIMIT_MAX: number;
  S3_REGION: string;
  S3_ACCESS_KEY_ID: string;
  S3_SECRET_ACCESS_KEY: string;
  S3_BUCKET: string;
  NEW_RELIC_LICENSE_KEY?: string;
}

export const config: Config = {
  NODE_ENV: (process.env.NODE_ENV as 'development' | 'production' | 'staging') || 'development',
  JWT_SECRET: process.env.JWT_SECRET || 'your-secret-key',
  REDIS_URL: process.env.REDIS_URL || 'redis://localhost:6379',
  DATABASE_URL: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/floussly',
  APP_NAME: process.env.APP_NAME || 'Floussly',
  APP_VERSION: process.env.APP_VERSION || '1.0.0',
  API_VERSION: process.env.API_VERSION || 'v1',
  JWT_EXPIRY: process.env.JWT_EXPIRY || '24h',
  PORT: parseInt(process.env.PORT || '3000', 10),
  LOG_LEVEL: process.env.LOG_LEVEL || 'info',
  CORS_ORIGIN: process.env.CORS_ORIGIN || '*',
  RATE_LIMIT_WINDOW: parseInt(process.env.RATE_LIMIT_WINDOW || '900000', 10), // 15 minutes
  RATE_LIMIT_MAX: parseInt(process.env.RATE_LIMIT_MAX || '100', 10),
  S3_REGION: process.env.S3_REGION || 'us-east-1',
  S3_ACCESS_KEY_ID: process.env.S3_ACCESS_KEY_ID || '',
  S3_SECRET_ACCESS_KEY: process.env.S3_SECRET_ACCESS_KEY || '',
  S3_BUCKET: process.env.S3_BUCKET || 'floussly-audit-logs',
  NEW_RELIC_LICENSE_KEY: process.env.NEW_RELIC_LICENSE_KEY
}; 