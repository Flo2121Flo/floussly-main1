import { SECURITY_CONFIG } from '../config/security';
import DOMPurify from 'dompurify';

// XSS Protection
export const sanitizeHTML = (html: string): string => {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a'],
    ALLOWED_ATTR: ['href', 'target'],
  });
};

// CSRF Protection
export const getCSRFToken = (): string => {
  const token = document.cookie
    .split('; ')
    .find(row => row.startsWith('csrf-token='))
    ?.split('=')[1];

  if (!token) {
    throw new Error('CSRF token not found');
  }

  return token;
};

// Secure Storage
export class SecureStorage {
  private static instance: SecureStorage;
  private encryptionKey: string;

  private constructor() {
    this.encryptionKey = process.env.ENCRYPTION_KEY || 'default-key';
  }

  public static getInstance(): SecureStorage {
    if (!SecureStorage.instance) {
      SecureStorage.instance = new SecureStorage();
    }
    return SecureStorage.instance;
  }

  private encrypt(data: string): string {
    // TODO: Implement proper encryption
    return btoa(data);
  }

  private decrypt(data: string): string {
    // TODO: Implement proper decryption
    return atob(data);
  }

  public setItem(key: string, value: any): void {
    const encryptedValue = this.encrypt(JSON.stringify(value));
    localStorage.setItem(key, encryptedValue);
  }

  public getItem(key: string): any {
    const encryptedValue = localStorage.getItem(key);
    if (!encryptedValue) return null;
    return JSON.parse(this.decrypt(encryptedValue));
  }

  public removeItem(key: string): void {
    localStorage.removeItem(key);
  }

  public clear(): void {
    localStorage.clear();
  }
}

// Password Strength Checker
export const checkPasswordStrength = (password: string): { score: number; strength: 'weak' | 'medium' | 'strong' } => {
  let score = 0;
  const { minLength, requireUppercase, requireLowercase, requireNumbers, requireSpecialChars } = SECURITY_CONFIG.password;

  if (password.length >= minLength) score += 1;
  if (requireUppercase && /[A-Z]/.test(password)) score += 1;
  if (requireLowercase && /[a-z]/.test(password)) score += 1;
  if (requireNumbers && /[0-9]/.test(password)) score += 1;
  if (requireSpecialChars && /[^A-Za-z0-9]/.test(password)) score += 1;

  const strength = score <= 2 ? 'weak' : score <= 4 ? 'medium' : 'strong';
  return { score, strength };
};

// Secure API Request
export const secureFetch = async (url: string, options: RequestInit = {}): Promise<any> => {
  const { timeout, retryAttempts, retryDelay } = SECURITY_CONFIG.api;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  let lastError: Error | null = null;
  for (let attempt = 0; attempt <= retryAttempts; attempt++) {
    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          ...options.headers,
          'X-CSRF-Token': getCSRFToken(),
          'Content-Type': 'application/json',
        },
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      lastError = error as Error;
      if (attempt < retryAttempts) {
        await new Promise(resolve => setTimeout(resolve, retryDelay));
      }
    }
  }

  throw lastError;
};

// Input Validation
export const validateInput = (input: string, type: 'email' | 'password' | 'text'): boolean => {
  switch (type) {
    case 'email':
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input);
    case 'password':
      const { score } = checkPasswordStrength(input);
      return score >= 3;
    case 'text':
      return input.trim().length > 0;
    default:
      return false;
  }
};

// Session Management
export class SessionManager {
  private static instance: SessionManager;
  private inactivityTimeout: number;
  private sessionTimeout: number;

  private constructor() {
    this.inactivityTimeout = 30 * 60 * 1000; // 30 minutes
    this.sessionTimeout = 24 * 60 * 60 * 1000; // 24 hours
  }

  public static getInstance(): SessionManager {
    if (!SessionManager.instance) {
      SessionManager.instance = new SessionManager();
    }
    return SessionManager.instance;
  }

  public startSession(): void {
    this.resetInactivityTimer();
    this.setupEventListeners();
  }

  private resetInactivityTimer(): void {
    clearTimeout(this.inactivityTimeout);
    this.inactivityTimeout = window.setTimeout(() => {
      this.endSession();
    }, this.inactivityTimeout);
  }

  private setupEventListeners(): void {
    ['mousemove', 'keydown', 'click', 'scroll'].forEach(event => {
      document.addEventListener(event, () => this.resetInactivityTimer());
    });
  }

  public endSession(): void {
    // Clear session data
    SecureStorage.getInstance().clear();
    // Redirect to login
    window.location.href = '/login';
  }

  public validateSession(): boolean {
    const sessionStart = SecureStorage.getInstance().getItem('sessionStart');
    if (!sessionStart) return false;

    const sessionAge = Date.now() - sessionStart;
    return sessionAge < this.sessionTimeout;
  }
} 