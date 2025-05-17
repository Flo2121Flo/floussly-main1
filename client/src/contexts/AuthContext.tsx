import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as LocalAuthentication from 'expo-local-authentication';
import { api } from '../services/api';
import { useLanguage } from './LanguageContext';
import { logger } from '../utils/logger';

interface AuthContextData {
  isAuthenticated: boolean;
  user: any;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: any) => Promise<void>;
  logout: () => Promise<void>;
  setupBiometric: () => Promise<void>;
  authenticateWithBiometric: () => Promise<boolean>;
  refreshToken: () => Promise<void>;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider: React.FC = ({ children }) => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { translate } = useLanguage();

  useEffect(() => {
    loadStoredData();
  }, []);

  const loadStoredData = async () => {
    try {
      const [storedUser, storedToken] = await Promise.all([
        AsyncStorage.getItem('@Floussly:user'),
        AsyncStorage.getItem('@Floussly:token')
      ]);

      if (storedUser && storedToken) {
        api.defaults.headers.Authorization = `Bearer ${storedToken}`;
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      logger.error('Failed to load stored auth data', { error });
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await api.post('/auth/login', {
        email,
        password,
        deviceId: await getDeviceId(),
        deviceInfo: await getDeviceInfo()
      });

      const { user, tokens } = response.data;

      await Promise.all([
        AsyncStorage.setItem('@Floussly:user', JSON.stringify(user)),
        AsyncStorage.setItem('@Floussly:token', tokens.accessToken),
        AsyncStorage.setItem('@Floussly:refreshToken', tokens.refreshToken)
      ]);

      api.defaults.headers.Authorization = `Bearer ${tokens.accessToken}`;
      setUser(user);

      logger.info('User logged in successfully', { userId: user.id });
    } catch (error) {
      logger.error('Login failed', { error });
      throw error;
    }
  };

  const register = async (userData: any) => {
    try {
      const response = await api.post('/auth/register', userData);
      const { user, tokens } = response.data;

      await Promise.all([
        AsyncStorage.setItem('@Floussly:user', JSON.stringify(user)),
        AsyncStorage.setItem('@Floussly:token', tokens.accessToken),
        AsyncStorage.setItem('@Floussly:refreshToken', tokens.refreshToken)
      ]);

      api.defaults.headers.Authorization = `Bearer ${tokens.accessToken}`;
      setUser(user);

      logger.info('User registered successfully', { userId: user.id });
    } catch (error) {
      logger.error('Registration failed', { error });
      throw error;
    }
  };

  const logout = async () => {
    try {
      const refreshToken = await AsyncStorage.getItem('@Floussly:refreshToken');
      if (refreshToken) {
        await api.post('/auth/logout', { refreshToken });
      }

      await Promise.all([
        AsyncStorage.removeItem('@Floussly:user'),
        AsyncStorage.removeItem('@Floussly:token'),
        AsyncStorage.removeItem('@Floussly:refreshToken')
      ]);

      setUser(null);
      delete api.defaults.headers.Authorization;

      logger.info('User logged out successfully');
    } catch (error) {
      logger.error('Logout failed', { error });
      throw error;
    }
  };

  const setupBiometric = async () => {
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();

      if (!hasHardware || !isEnrolled) {
        throw new Error(translate('biometric_not_available'));
      }

      const { publicKey, signature } = await LocalAuthentication.authenticateAsync({
        promptMessage: translate('biometric_setup_message'),
        disableDeviceFallback: true
      });

      await api.post('/auth/biometric/setup', {
        deviceId: await getDeviceId(),
        publicKey,
        signature
      });

      logger.info('Biometric authentication setup completed');
    } catch (error) {
      logger.error('Biometric setup failed', { error });
      throw error;
    }
  };

  const authenticateWithBiometric = async (): Promise<boolean> => {
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();

      if (!hasHardware || !isEnrolled) {
        return false;
      }

      const { success, signature } = await LocalAuthentication.authenticateAsync({
        promptMessage: translate('biometric_auth_message'),
        disableDeviceFallback: true
      });

      if (success && signature) {
        const response = await api.post('/auth/biometric/verify', {
          deviceId: await getDeviceId(),
          signature
        });

        const { tokens } = response.data;
        await Promise.all([
          AsyncStorage.setItem('@Floussly:token', tokens.accessToken),
          AsyncStorage.setItem('@Floussly:refreshToken', tokens.refreshToken)
        ]);

        api.defaults.headers.Authorization = `Bearer ${tokens.accessToken}`;
        return true;
      }

      return false;
    } catch (error) {
      logger.error('Biometric authentication failed', { error });
      return false;
    }
  };

  const refreshToken = async () => {
    try {
      const refreshToken = await AsyncStorage.getItem('@Floussly:refreshToken');
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await api.post('/auth/refresh', { refreshToken });
      const { tokens } = response.data;

      await Promise.all([
        AsyncStorage.setItem('@Floussly:token', tokens.accessToken),
        AsyncStorage.setItem('@Floussly:refreshToken', tokens.refreshToken)
      ]);

      api.defaults.headers.Authorization = `Bearer ${tokens.accessToken}`;
    } catch (error) {
      logger.error('Token refresh failed', { error });
      await logout();
    }
  };

  const getDeviceId = async (): Promise<string> => {
    const deviceId = await AsyncStorage.getItem('@Floussly:deviceId');
    if (deviceId) return deviceId;

    const newDeviceId = Math.random().toString(36).substring(7);
    await AsyncStorage.setItem('@Floussly:deviceId', newDeviceId);
    return newDeviceId;
  };

  const getDeviceInfo = async () => {
    const deviceInfo = {
      platform: Platform.OS,
      version: Platform.Version,
      model: await LocalAuthentication.getDeviceNameAsync()
    };
    return deviceInfo;
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: !!user,
        user,
        loading,
        login,
        register,
        logout,
        setupBiometric,
        authenticateWithBiometric,
        refreshToken
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 