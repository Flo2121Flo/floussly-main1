import axios from 'axios';
import { securityConfig } from '../config/security';
import { logger } from '../utils/logger';
import { Platform } from 'react-native';

const BASE_URL = process.env.API_URL || 'https://api.floussly.com';

// Create axios instance with security configurations
const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Request interceptor
api.interceptors.request.use(
  async (config) => {
    try {
      // Add device fingerprint
      const fingerprint = await securityConfig.deviceFingerprint.getFingerprint();
      config.headers['x-device-fingerprint'] = fingerprint;

      // Add authentication token
      const token = await securityConfig.tokenStorage.getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      // Add security headers
      config.headers['x-app-version'] = process.env.APP_VERSION;
      config.headers['x-platform'] = Platform.OS;
      config.headers['x-security-level'] = 'high';

      return config;
    } catch (error) {
      logger.error('API request interceptor error', { error: error.message });
      return Promise.reject(error);
    }
  },
  (error) => {
    logger.error('API request error', { error: error.message });
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    // Log successful responses
    logger.info('API response', {
      url: response.config.url,
      status: response.status
    });
    return response;
  },
  async (error) => {
    if (error.response) {
      // Handle specific error cases
      switch (error.response.status) {
        case 401:
          // Token expired or invalid
          await securityConfig.tokenStorage.removeToken();
          // Redirect to login
          break;
        case 403:
          // Access denied
          logger.warn('Access denied', {
            url: error.config.url,
            status: error.response.status
          });
          break;
        case 429:
          // Rate limit exceeded
          logger.warn('Rate limit exceeded', {
            url: error.config.url,
            status: error.response.status
          });
          break;
        default:
          logger.error('API error', {
            url: error.config.url,
            status: error.response.status,
            data: error.response.data
          });
      }
    } else if (error.request) {
      // Network error
      logger.error('Network error', { error: error.message });
    } else {
      // Other error
      logger.error('API error', { error: error.message });
    }
    return Promise.reject(error);
  }
);

// API endpoints with security measures
export const apiEndpoints = {
  // Authentication
  auth: {
    login: async (credentials: { email: string; password: string }) => {
      const response = await api.post('/auth/login', credentials);
      await securityConfig.tokenStorage.storeToken(response.data.token);
      return response.data;
    },
    logout: async () => {
      await api.post('/auth/logout');
      await securityConfig.tokenStorage.removeToken();
    },
    refreshToken: async () => {
      const response = await api.post('/auth/refresh');
      await securityConfig.tokenStorage.storeToken(response.data.token);
      return response.data;
    }
  },

  // User data
  user: {
    getProfile: () => api.get('/user/profile'),
    updateProfile: (data: any) => api.put('/user/profile', data),
    changePassword: (data: { currentPassword: string; newPassword: string }) =>
      api.post('/user/change-password', data)
  },

  // Transactions
  transactions: {
    create: (data: any) => api.post('/transactions', data),
    list: (params: any) => api.get('/transactions', { params }),
    getDetails: (id: string) => api.get(`/transactions/${id}`)
  },

  // KYC
  kyc: {
    uploadDocument: (formData: FormData) =>
      api.post('/kyc/documents', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }),
    getStatus: () => api.get('/kyc/status')
  }
};

// API endpoints
export const endpoints = {
  auth: {
    login: '/auth/login',
    register: '/auth/register',
    logout: '/auth/logout',
    refresh: '/auth/refresh',
    biometric: {
      setup: '/auth/biometric/setup',
      verify: '/auth/biometric/verify'
    }
  },
  user: {
    profile: '/user/profile',
    update: '/user/update',
    kyc: {
      submit: '/user/kyc/submit',
      status: '/user/kyc/status'
    }
  },
  wallet: {
    balance: '/wallet/balance',
    transactions: '/wallet/transactions',
    transfer: '/wallet/transfer'
  },
  language: {
    translations: '/language/translations',
    set: '/language/set'
  }
};

// API methods
export const apiMethods = {
  auth: {
    login: (data: any) => api.post(endpoints.auth.login, data),
    register: (data: any) => api.post(endpoints.auth.register, data),
    logout: () => api.post(endpoints.auth.logout),
    refreshToken: (refreshToken: string) => api.post(endpoints.auth.refresh, { refreshToken }),
    setupBiometric: (data: any) => api.post(endpoints.auth.biometric.setup, data),
    verifyBiometric: (data: any) => api.post(endpoints.auth.biometric.verify, data)
  },
  user: {
    getProfile: () => api.get(endpoints.user.profile),
    updateProfile: (data: any) => api.put(endpoints.user.update, data),
    submitKYC: (data: any) => api.post(endpoints.user.kyc.submit, data),
    getKYCStatus: () => api.get(endpoints.user.kyc.status)
  },
  wallet: {
    getBalance: () => api.get(endpoints.wallet.balance),
    getTransactions: (params: any) => api.get(endpoints.wallet.transactions, { params }),
    transfer: (data: any) => api.post(endpoints.wallet.transfer, data)
  },
  language: {
    getTranslations: (language: string) => api.get(endpoints.language.translations, { params: { language } }),
    setLanguage: (language: string) => api.post(endpoints.language.set, { language })
  }
};

export default api; 