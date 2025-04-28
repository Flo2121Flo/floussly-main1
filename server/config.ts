import dotenv from 'dotenv';

dotenv.config();

interface SecurityConfig {
  helmet: {
    contentSecurityPolicy: boolean;
    crossOriginEmbedderPolicy: boolean;
    crossOriginOpenerPolicy: boolean;
    crossOriginResourcePolicy: boolean;
    dnsPrefetchControl: boolean;
    frameguard: boolean;
    hidePoweredBy: boolean;
    hsts: boolean;
    ieNoOpen: boolean;
    noSniff: boolean;
    originAgentCluster: boolean;
    permittedCrossDomainPolicies: boolean;
    referrerPolicy: boolean;
    xssFilter: boolean;
  };
  cors: {
    origin: string | string[];
    methods: string[];
    allowedHeaders: string[];
    credentials: boolean;
  };
}

interface Config {
  port: number;
  env: string;
  database: {
    host: string;
    port: number;
    user: string;
    password: string;
    database: string;
    url: string;
    poolSize: number;
    ssl: boolean;
  };
  redis: {
    host: string;
    port: number;
    password: string | null;
  };
  aws: {
    accessKeyId: string;
    secretAccessKey: string;
    region: string;
    s3Bucket: string;
  };
  jwt: {
    secret: string;
    expiresIn: string;
  };
  email: {
    host: string;
    port: number;
    secure: boolean;
    auth: {
      user: string;
      pass: string;
    };
  };
  rateLimit: {
    window: number;
    max: number;
  };
  security: SecurityConfig;
  moroccanBank: {
    apiKey: string;
    baseUrl: string;
    banks: {
      attijariwafa: {
        code: string;
        name: string;
        apiUrl: string;
      };
      bmce: {
        code: string;
        name: string;
        apiUrl: string;
      };
      cih: {
        code: string;
        name: string;
        apiUrl: string;
      };
      bam: {
        code: string;
        name: string;
        apiUrl: string;
      };
    };
  };
  banking: {
    m2t: {
      apiKey: string;
      secretKey: string;
    };
    cmi: {
      apiKey: string;
    };
    bankAlMaghrib: {
      apiKey: string;
    };
  };
}

const securityConfig: SecurityConfig = {
  helmet: {
    contentSecurityPolicy: true,
    crossOriginEmbedderPolicy: true,
    crossOriginOpenerPolicy: true,
    crossOriginResourcePolicy: true,
    dnsPrefetchControl: true,
    frameguard: true,
    hidePoweredBy: true,
    hsts: true,
    ieNoOpen: true,
    noSniff: true,
    originAgentCluster: true,
    permittedCrossDomainPolicies: true,
    referrerPolicy: true,
    xssFilter: true
  },
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
  }
};

export const config: Config = {
  port: parseInt(process.env.PORT || '3000', 10),
  env: process.env.NODE_ENV || 'development',
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'floussly',
    url: process.env.DATABASE_URL || `postgres://${process.env.DB_USER || 'postgres'}:${process.env.DB_PASSWORD || 'postgres'}@${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || '5432'}/${process.env.DB_NAME || 'floussly'}`,
    poolSize: parseInt(process.env.DB_POOL_SIZE || '20', 10),
    ssl: process.env.DB_SSL === 'true'
  },
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD || null,
  },
  aws: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
    region: process.env.AWS_REGION || 'us-east-1',
    s3Bucket: process.env.AWS_S3_BUCKET || 'floussly',
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key',
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
  },
  email: {
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT || '587', 10),
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
      user: process.env.EMAIL_USER || '',
      pass: process.env.EMAIL_PASS || '',
    },
  },
  rateLimit: {
    window: 15 * 60 * 1000, // 15 minutes
    max: 100,
  },
  security: securityConfig,
  moroccanBank: {
    apiKey: process.env.MOROCCAN_BANK_API_KEY || '',
    baseUrl: process.env.MOROCCAN_BANK_BASE_URL || 'https://api.moroccanbank.com',
    banks: {
      attijariwafa: {
        code: 'ATW',
        name: 'Attijariwafa Bank',
        apiUrl: 'https://api.attijariwafa.com',
      },
      bmce: {
        code: 'BMCE',
        name: 'BMCE Bank',
        apiUrl: 'https://api.bmcebank.ma',
      },
      cih: {
        code: 'CIH',
        name: 'CIH Bank',
        apiUrl: 'https://api.cihbank.ma',
      },
      bam: {
        code: 'BAM',
        name: 'Bank Al-Maghrib',
        apiUrl: 'https://api.bankal-maghrib.ma',
      },
    },
  },
  banking: {
    m2t: {
      apiKey: process.env.M2T_API_KEY || 'your_m2t_api_key',
      secretKey: process.env.M2T_SECRET_KEY || 'your_m2t_secret_key'
    },
    cmi: {
      apiKey: process.env.CMI_API_KEY || 'your_cmi_api_key'
    },
    bankAlMaghrib: {
      apiKey: process.env.BANK_AL_MAGHRIB_API_KEY || 'your_bam_api_key'
    }
  },
}; 