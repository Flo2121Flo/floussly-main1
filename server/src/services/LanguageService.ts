import { User } from '../models/User';
import { logger } from '../utils/logger';
import { redis } from '../utils/redis';
import { validateLanguage } from '../utils/validators';

interface Translation {
  key: string;
  ar: string;
  fr: string;
  en: string;
  ber: string;
}

export class LanguageService {
  private static instance: LanguageService;
  private readonly SUPPORTED_LANGUAGES = ['ar', 'fr', 'en', 'ber'];
  private readonly DEFAULT_LANGUAGE = 'en';
  private translations: Map<string, Translation> = new Map();

  private constructor() {
    this.initializeTranslations();
  }

  public static getInstance(): LanguageService {
    if (!LanguageService.instance) {
      LanguageService.instance = new LanguageService();
    }
    return LanguageService.instance;
  }

  private async initializeTranslations(): Promise<void> {
    try {
      // Load translations from Redis cache
      const cachedTranslations = await redis.get('translations');
      if (cachedTranslations) {
        const translations = JSON.parse(cachedTranslations);
        this.translations = new Map(Object.entries(translations));
        return;
      }

      // If not in cache, load from database or file
      // This is a placeholder - implement actual translation loading
      const defaultTranslations: { [key: string]: Translation } = {
        'welcome': {
          key: 'welcome',
          ar: 'مرحباً',
          fr: 'Bienvenue',
          en: 'Welcome',
          ber: 'Ansaḥ'
        },
        'login': {
          key: 'login',
          ar: 'تسجيل الدخول',
          fr: 'Connexion',
          en: 'Login',
          ber: 'Kcem'
        },
        'register': {
          key: 'register',
          ar: 'تسجيل',
          fr: 'Inscription',
          en: 'Register',
          ber: 'Inselmed'
        },
        'balance': {
          key: 'balance',
          ar: 'الرصيد',
          fr: 'Solde',
          en: 'Balance',
          ber: 'Lḥesab'
        },
        'transfer': {
          key: 'transfer',
          ar: 'تحويل',
          fr: 'Transfert',
          en: 'Transfer',
          ber: 'Sifed'
        },
        'settings': {
          key: 'settings',
          ar: 'الإعدادات',
          fr: 'Paramètres',
          en: 'Settings',
          ber: 'Iɣewwaṛen'
        },
        'profile': {
          key: 'profile',
          ar: 'الملف الشخصي',
          fr: 'Profil',
          en: 'Profile',
          ber: 'Aɣmis'
        },
        'security': {
          key: 'security',
          ar: 'الأمان',
          fr: 'Sécurité',
          en: 'Security',
          ber: 'Aman'
        },
        'notifications': {
          key: 'notifications',
          ar: 'الإشعارات',
          fr: 'Notifications',
          en: 'Notifications',
          ber: 'Iɣewwaṛen'
        },
        'logout': {
          key: 'logout',
          ar: 'تسجيل الخروج',
          fr: 'Déconnexion',
          en: 'Logout',
          ber: 'Ffeɣ'
        }
      };

      // Store in Redis cache
      await redis.setex(
        'translations',
        24 * 60 * 60, // 24 hours
        JSON.stringify(defaultTranslations)
      );

      this.translations = new Map(Object.entries(defaultTranslations));
    } catch (error) {
      logger.error('Failed to initialize translations', {
        error: error.message,
        timestamp: new Date().toISOString()
      });
      throw error;
    }
  }

  async setUserLanguage(userId: string, language: string): Promise<void> {
    try {
      if (!validateLanguage(language)) {
        throw new Error('Unsupported language');
      }

      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      user.language = language;
      await user.save();

      // Update user's language preference in Redis
      await redis.setex(
        `user:${userId}:language`,
        30 * 24 * 60 * 60, // 30 days
        language
      );

      logger.info('User language updated', {
        userId,
        language,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.error('Failed to set user language', {
        error: error.message,
        userId,
        language,
        timestamp: new Date().toISOString()
      });
      throw error;
    }
  }

  async getUserLanguage(userId: string): Promise<string> {
    try {
      // Try to get from Redis cache first
      const cachedLanguage = await redis.get(`user:${userId}:language`);
      if (cachedLanguage) {
        return cachedLanguage;
      }

      // If not in cache, get from database
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Cache the result
      await redis.setex(
        `user:${userId}:language`,
        30 * 24 * 60 * 60, // 30 days
        user.language || this.DEFAULT_LANGUAGE
      );

      return user.language || this.DEFAULT_LANGUAGE;
    } catch (error) {
      logger.error('Failed to get user language', {
        error: error.message,
        userId,
        timestamp: new Date().toISOString()
      });
      return this.DEFAULT_LANGUAGE;
    }
  }

  async translate(key: string, language: string): Promise<string> {
    try {
      if (!validateLanguage(language)) {
        language = this.DEFAULT_LANGUAGE;
      }

      const translation = this.translations.get(key);
      if (!translation) {
        logger.warn('Translation key not found', {
          key,
          language,
          timestamp: new Date().toISOString()
        });
        return key;
      }

      return translation[language as keyof Translation] || translation[this.DEFAULT_LANGUAGE as keyof Translation];
    } catch (error) {
      logger.error('Translation failed', {
        error: error.message,
        key,
        language,
        timestamp: new Date().toISOString()
      });
      return key;
    }
  }

  async addTranslation(translation: Translation): Promise<void> {
    try {
      // Validate all language values
      for (const lang of this.SUPPORTED_LANGUAGES) {
        if (!translation[lang as keyof Translation]) {
          throw new Error(`Missing translation for language: ${lang}`);
        }
      }

      // Add to memory
      this.translations.set(translation.key, translation);

      // Update Redis cache
      const translations = Object.fromEntries(this.translations);
      await redis.setex(
        'translations',
        24 * 60 * 60, // 24 hours
        JSON.stringify(translations)
      );

      logger.info('Translation added', {
        key: translation.key,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.error('Failed to add translation', {
        error: error.message,
        key: translation.key,
        timestamp: new Date().toISOString()
      });
      throw error;
    }
  }

  async updateTranslation(key: string, language: string, value: string): Promise<void> {
    try {
      if (!validateLanguage(language)) {
        throw new Error('Unsupported language');
      }

      const translation = this.translations.get(key);
      if (!translation) {
        throw new Error('Translation key not found');
      }

      // Update translation
      translation[language as keyof Translation] = value;
      this.translations.set(key, translation);

      // Update Redis cache
      const translations = Object.fromEntries(this.translations);
      await redis.setex(
        'translations',
        24 * 60 * 60, // 24 hours
        JSON.stringify(translations)
      );

      logger.info('Translation updated', {
        key,
        language,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.error('Failed to update translation', {
        error: error.message,
        key,
        language,
        timestamp: new Date().toISOString()
      });
      throw error;
    }
  }

  async deleteTranslation(key: string): Promise<void> {
    try {
      if (!this.translations.has(key)) {
        throw new Error('Translation key not found');
      }

      // Remove from memory
      this.translations.delete(key);

      // Update Redis cache
      const translations = Object.fromEntries(this.translations);
      await redis.setex(
        'translations',
        24 * 60 * 60, // 24 hours
        JSON.stringify(translations)
      );

      logger.info('Translation deleted', {
        key,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.error('Failed to delete translation', {
        error: error.message,
        key,
        timestamp: new Date().toISOString()
      });
      throw error;
    }
  }

  getSupportedLanguages(): string[] {
    return this.SUPPORTED_LANGUAGES;
  }

  getDefaultLanguage(): string {
    return this.DEFAULT_LANGUAGE;
  }
}

export default LanguageService; 