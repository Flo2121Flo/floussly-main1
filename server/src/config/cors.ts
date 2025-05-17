import cors from 'cors';
import { appConfig } from './app';

const allowedOrigins = [
  'https://floussly.com',
  'https://app.floussly.com',
  'https://staging.floussly.com',
  'https://admin.floussly.com'
];

if (appConfig.env === 'development') {
  allowedOrigins.push('http://localhost:3000', 'http://localhost:5173');
}

export const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin',
    'X-API-Key'
  ],
  exposedHeaders: ['X-RateLimit-Limit', 'X-RateLimit-Remaining'],
  credentials: true,
  maxAge: 86400 // 24 hours
};

export const corsMiddleware = cors(corsOptions); 