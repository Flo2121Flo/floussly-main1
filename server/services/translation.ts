import i18next from 'i18next';
import { z } from 'zod';
import { logger } from '../utils/logger';

// Supported languages
export const SUPPORTED_LANGUAGES = ['en', 'fr', 'ar', 'tzm'] as const;
export type SupportedLanguage = typeof SUPPORTED_LANGUAGES[number];

// Language detection schema
const languageDetectionSchema = z.object({
  text: z.string(),
  preferredLanguage: z.string().optional(),
});

export class TranslationService {
  private static instance: TranslationService;
  private initialized = false;

  private constructor() {}

  static getInstance(): TranslationService {
    if (!TranslationService.instance) {
      TranslationService.instance = new TranslationService();
    }
    return TranslationService.instance;
  }

  async initialize() {
    if (this.initialized) return;

    await i18next.init({
      lng: 'en',
      fallbackLng: 'en',
      supportedLngs: SUPPORTED_LANGUAGES,
      resources: {
        en: {
          translation: {
            // System messages
            'floussdrop.created': 'FloussDrop created successfully!',
            'floussdrop.unlocked': 'FloussDrop unlocked! You received {{amount}} MAD',
            'floussdrop.expired': 'This FloussDrop has expired',
            'floussdrop.not_found': 'FloussDrop not found',
            'floussdrop.invalid_code': 'Invalid secret code',
            'floussdrop.too_far': 'You are too far from the FloussDrop',
            'floussdrop.proximity.cold': 'Cold ❄️',
            'floussdrop.proximity.warm': 'Getting warmer 🔥',
            'floussdrop.proximity.hot': 'Hot! You\'re close! 🔥🔥🔥',
            'floussdrop.expiry.remaining': 'Expires in {{time}}',
            'floussdrop.expiry.expired': 'This FloussDrop has expired',

            // Money transfer
            'transfer.sent': 'Money sent successfully',
            'transfer.received': 'You received {{amount}} MAD',
            'transfer.failed': 'Transfer failed',
            'transfer.pending': 'Transfer pending confirmation',

            // General
            'error.generic': 'An error occurred',
            'error.unauthorized': 'Unauthorized access',
            'error.invalid_input': 'Invalid input',
          },
        },
        fr: {
          translation: {
            // System messages
            'floussdrop.created': 'FloussDrop créé avec succès !',
            'floussdrop.unlocked': 'FloussDrop débloqué ! Vous avez reçu {{amount}} MAD',
            'floussdrop.expired': 'Ce FloussDrop a expiré',
            'floussdrop.not_found': 'FloussDrop non trouvé',
            'floussdrop.invalid_code': 'Code secret invalide',
            'floussdrop.too_far': 'Vous êtes trop loin du FloussDrop',
            'floussdrop.proximity.cold': 'Froid ❄️',
            'floussdrop.proximity.warm': 'Ça chauffe 🔥',
            'floussdrop.proximity.hot': 'Chaud ! Vous êtes proche ! 🔥🔥🔥',
            'floussdrop.expiry.remaining': 'Expire dans {{time}}',
            'floussdrop.expiry.expired': 'Ce FloussDrop a expiré',

            // Money transfer
            'transfer.sent': 'Argent envoyé avec succès',
            'transfer.received': 'Vous avez reçu {{amount}} MAD',
            'transfer.failed': 'Transfert échoué',
            'transfer.pending': 'Transfert en attente de confirmation',

            // General
            'error.generic': 'Une erreur est survenue',
            'error.unauthorized': 'Accès non autorisé',
            'error.invalid_input': 'Entrée invalide',
          },
        },
        ar: {
          translation: {
            // System messages
            'floussdrop.created': 'تم إنشاء FloussDrop بنجاح!',
            'floussdrop.unlocked': 'تم فتح FloussDrop! لقد استلمت {{amount}} درهم',
            'floussdrop.expired': 'انتهت صلاحية هذا FloussDrop',
            'floussdrop.not_found': 'لم يتم العثور على FloussDrop',
            'floussdrop.invalid_code': 'الرمز السري غير صالح',
            'floussdrop.too_far': 'أنت بعيد جدًا عن FloussDrop',
            'floussdrop.proximity.cold': 'بارد ❄️',
            'floussdrop.proximity.warm': 'يصبح أكثر دفئًا 🔥',
            'floussdrop.proximity.hot': 'حار! أنت قريب! 🔥🔥🔥',
            'floussdrop.expiry.remaining': 'ينتهي في {{time}}',
            'floussdrop.expiry.expired': 'انتهت صلاحية هذا FloussDrop',

            // Money transfer
            'transfer.sent': 'تم إرسال المال بنجاح',
            'transfer.received': 'لقد استلمت {{amount}} درهم',
            'transfer.failed': 'فشل التحويل',
            'transfer.pending': 'التحويل في انتظار التأكيد',

            // General
            'error.generic': 'حدث خطأ',
            'error.unauthorized': 'وصول غير مصرح به',
            'error.invalid_input': 'إدخال غير صالح',
          },
        },
        tzm: {
          translation: {
            // System messages
            'floussdrop.created': 'FloussDrop yettwarna akken iwata!',
            'floussdrop.unlocked': 'FloussDrop yettwaf! Kcem-ak {{amount}} dirham',
            'floussdrop.expired': 'FloussDrop-a imɣi',
            'floussdrop.not_found': 'Ulac FloussDrop',
            'floussdrop.invalid_code': 'Asfer n FloussDrop mačči d ameɣtu',
            'floussdrop.too_far': 'Kečč d meqqer seg FloussDrop',
            'floussdrop.proximity.cold': 'Sefri ❄️',
            'floussdrop.proximity.warm': 'Iḥemmel 🔥',
            'floussdrop.proximity.hot': 'Sḥan! Kečč d meqqran! 🔥🔥🔥',
            'floussdrop.expiry.remaining': 'Ad imɣi deg {{time}}',
            'floussdrop.expiry.expired': 'FloussDrop-a imɣi',

            // Money transfer
            'transfer.sent': 'Imal yettwazen akken iwata',
            'transfer.received': 'Kcem-ak {{amount}} dirham',
            'transfer.failed': 'Azen n imal yeggez',
            'transfer.pending': 'Azen n imal yegga',

            // General
            'error.generic': 'Yella wugur',
            'error.unauthorized': 'Ur sɛiḍ ara anekcum',
            'error.invalid_input': 'Anekcum mačči d ameɣtu',
          },
        },
      },
    });

    this.initialized = true;
    logger.info('Translation service initialized');
  }

  async detectLanguage(data: z.infer<typeof languageDetectionSchema>): Promise<SupportedLanguage> {
    const { text, preferredLanguage } = languageDetectionSchema.parse(data);

    // If user has a preferred language, use it
    if (preferredLanguage && SUPPORTED_LANGUAGES.includes(preferredLanguage as SupportedLanguage)) {
      return preferredLanguage as SupportedLanguage;
    }

    // Simple language detection based on character sets
    const arabicChars = /[\u0600-\u06FF]/;
    const frenchChars = /[éèêëàâçîïôöûüù]/i;
    const tifinaghChars = /[\u2D30-\u2D7F]/;

    if (arabicChars.test(text)) {
      return 'ar';
    } else if (frenchChars.test(text)) {
      return 'fr';
    } else if (tifinaghChars.test(text)) {
      return 'tzm';
    }

    // Default to English if no clear language detected
    return 'en';
  }

  translate(key: string, language: SupportedLanguage, options?: Record<string, any>): string {
    return i18next.t(key, { lng: language, ...options });
  }

  async translateMessage(
    text: string,
    sourceLanguage: SupportedLanguage,
    targetLanguage: SupportedLanguage
  ): Promise<string> {
    // In a real implementation, you would use a translation API here
    // For now, we'll just return the original text
    return text;
  }
} 