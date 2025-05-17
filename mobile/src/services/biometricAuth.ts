import * as LocalAuthentication from 'expo-local-authentication';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const BIOMETRIC_ENABLED_KEY = '@biometric_enabled';
const BIOMETRIC_CREDENTIALS_KEY = '@biometric_credentials';

interface BiometricCredentials {
  username: string;
  password: string;
}

class BiometricAuthService {
  private static instance: BiometricAuthService;
  private isBiometricAvailable: boolean | null = null;
  private isBiometricEnabled: boolean | null = null;

  private constructor() {}

  static getInstance(): BiometricAuthService {
    if (!BiometricAuthService.instance) {
      BiometricAuthService.instance = new BiometricAuthService();
    }
    return BiometricAuthService.instance;
  }

  async checkBiometricAvailability(): Promise<boolean> {
    if (this.isBiometricAvailable !== null) {
      return this.isBiometricAvailable;
    }

    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    const isEnrolled = await LocalAuthentication.isEnrolledAsync();

    this.isBiometricAvailable = hasHardware && isEnrolled;
    return this.isBiometricAvailable;
  }

  async isBiometricEnabled(): Promise<boolean> {
    if (this.isBiometricEnabled !== null) {
      return this.isBiometricEnabled;
    }

    const enabled = await AsyncStorage.getItem(BIOMETRIC_ENABLED_KEY);
    this.isBiometricEnabled = enabled === 'true';
    return this.isBiometricEnabled;
  }

  async enableBiometric(username: string, password: string): Promise<boolean> {
    const isAvailable = await this.checkBiometricAvailability();
    if (!isAvailable) {
      throw new Error('Biometric authentication is not available on this device');
    }

    const credentials: BiometricCredentials = { username, password };
    await AsyncStorage.setItem(BIOMETRIC_CREDENTIALS_KEY, JSON.stringify(credentials));
    await AsyncStorage.setItem(BIOMETRIC_ENABLED_KEY, 'true');
    this.isBiometricEnabled = true;

    return true;
  }

  async disableBiometric(): Promise<void> {
    await AsyncStorage.removeItem(BIOMETRIC_CREDENTIALS_KEY);
    await AsyncStorage.setItem(BIOMETRIC_ENABLED_KEY, 'false');
    this.isBiometricEnabled = false;
  }

  async authenticate(): Promise<BiometricCredentials | null> {
    const isAvailable = await this.checkBiometricAvailability();
    const isEnabled = await this.isBiometricEnabled();

    if (!isAvailable || !isEnabled) {
      return null;
    }

    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Authenticate to access your account',
      fallbackLabel: 'Use passcode',
      cancelLabel: 'Cancel',
      disableDeviceFallback: false
    });

    if (result.success) {
      const credentialsStr = await AsyncStorage.getItem(BIOMETRIC_CREDENTIALS_KEY);
      if (credentialsStr) {
        return JSON.parse(credentialsStr) as BiometricCredentials;
      }
    }

    return null;
  }

  async getBiometricType(): Promise<string> {
    const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
    
    if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
      return 'Face ID';
    } else if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
      return 'Fingerprint';
    } else if (types.includes(LocalAuthentication.AuthenticationType.IRIS)) {
      return 'Iris';
    }
    
    return 'Biometric';
  }

  async clearBiometricData(): Promise<void> {
    await AsyncStorage.removeItem(BIOMETRIC_CREDENTIALS_KEY);
    await AsyncStorage.removeItem(BIOMETRIC_ENABLED_KEY);
    this.isBiometricEnabled = false;
  }
}

export const biometricAuth = BiometricAuthService.getInstance(); 