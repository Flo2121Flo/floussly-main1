import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import Backend from 'i18next-http-backend';

// Language configurations
const languages = {
  en: {
    name: 'English',
    dir: 'ltr',
    dateFormat: 'MM/DD/YYYY',
    timeFormat: 'hh:mm A',
  },
  ar: {
    name: 'العربية',
    dir: 'rtl',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: 'hh:mm A',
  },
  fr: {
    name: 'Français',
    dir: 'ltr',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: 'HH:mm',
  },
  ber: {
    name: 'ⵜⴰⵎⴰⵣⵉⵖⵜ',
    dir: 'ltr',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: 'HH:mm',
  },
};

// Initialize i18next
i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',
    supportedLngs: Object.keys(languages),
    debug: process.env.NODE_ENV === 'development',
    interpolation: {
      escapeValue: false,
    },
    backend: {
      loadPath: '/locales/{{lng}}/{{ns}}.json',
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
  });

// Helper functions
export const getLanguageInfo = (lang: keyof typeof languages) => languages[lang];

export const getCurrentLanguage = () => i18n.language;

export const isRTL = () => {
  const currentLang = getCurrentLanguage() as keyof typeof languages;
  return languages[currentLang]?.dir === 'rtl';
};

export const formatDate = (date: Date, lang?: keyof typeof languages) => {
  const currentLang = lang || (getCurrentLanguage() as keyof typeof languages);
  return new Intl.DateTimeFormat(currentLang, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
};

export const formatTime = (date: Date, lang?: keyof typeof languages) => {
  const currentLang = lang || (getCurrentLanguage() as keyof typeof languages);
  return new Intl.DateTimeFormat(currentLang, {
    hour: '2-digit',
    minute: '2-digit',
    hour12: languages[currentLang].timeFormat.includes('A'),
  }).format(date);
};

export const formatNumber = (number: number, lang?: keyof typeof languages) => {
  const currentLang = lang || (getCurrentLanguage() as keyof typeof languages);
  return new Intl.NumberFormat(currentLang).format(number);
};

export const formatCurrency = (amount: number, currency: string = 'MAD', lang?: keyof typeof languages) => {
  const currentLang = lang || (getCurrentLanguage() as keyof typeof languages);
  return new Intl.NumberFormat(currentLang, {
    style: 'currency',
    currency,
  }).format(amount);
};

// Hook for language switching
export const useLanguage = () => {
  const changeLanguage = async (lang: keyof typeof languages) => {
    try {
      await i18n.changeLanguage(lang);
      document.documentElement.dir = languages[lang].dir;
      document.documentElement.lang = lang;
      localStorage.setItem('i18nextLng', lang);
    } catch (error) {
      console.error('Failed to change language:', error);
    }
  };

  return {
    currentLanguage: getCurrentLanguage(),
    languages,
    changeLanguage,
    isRTL: isRTL(),
    formatDate,
    formatTime,
    formatNumber,
    formatCurrency,
  };
};

// Default translations for common phrases
export const defaultTranslations = {
  en: {
    common: {
      loading: 'Loading...',
      error: 'An error occurred',
      retry: 'Retry',
      save: 'Save',
      cancel: 'Cancel',
      delete: 'Delete',
      confirm: 'Confirm',
      back: 'Back',
      next: 'Next',
      done: 'Done',
    },
    auth: {
      login: 'Login',
      logout: 'Logout',
      signup: 'Sign Up',
      email: 'Email',
      password: 'Password',
      forgot_password: 'Forgot Password?',
    },
    chat: {
      new_message: 'New Message',
      type_message: 'Type a message...',
      send: 'Send',
      voice_message: 'Voice Message',
      add_money: 'Add Money',
    },
    treasure: {
      create: 'Create Treasure',
      find: 'Find Treasure',
      unlock: 'Unlock',
      claim: 'Claim',
      amount: 'Amount',
      location: 'Location',
    },
    payment: {
      amount: 'Amount',
      currency: 'Currency',
      pay: 'Pay',
      success: 'Payment Successful',
      failed: 'Payment Failed',
    },
  },
  ar: {
    common: {
      loading: 'جاري التحميل...',
      error: 'حدث خطأ',
      retry: 'إعادة المحاولة',
      save: 'حفظ',
      cancel: 'إلغاء',
      delete: 'حذف',
      confirm: 'تأكيد',
      back: 'رجوع',
      next: 'التالي',
      done: 'تم',
    },
    auth: {
      login: 'تسجيل الدخول',
      logout: 'تسجيل الخروج',
      signup: 'إنشاء حساب',
      email: 'البريد الإلكتروني',
      password: 'كلمة المرور',
      forgot_password: 'نسيت كلمة المرور؟',
    },
    chat: {
      new_message: 'رسالة جديدة',
      type_message: 'اكتب رسالة...',
      send: 'إرسال',
      voice_message: 'رسالة صوتية',
      add_money: 'إضافة المال',
    },
    treasure: {
      create: 'إنشاء كنز',
      find: 'البحث عن كنز',
      unlock: 'فتح',
      claim: 'مطالبة',
      amount: 'المبلغ',
      location: 'الموقع',
    },
    payment: {
      amount: 'المبلغ',
      currency: 'العملة',
      pay: 'دفع',
      success: 'تم الدفع بنجاح',
      failed: 'فشل الدفع',
    },
  },
  fr: {
    common: {
      loading: 'Chargement...',
      error: 'Une erreur est survenue',
      retry: 'Réessayer',
      save: 'Enregistrer',
      cancel: 'Annuler',
      delete: 'Supprimer',
      confirm: 'Confirmer',
      back: 'Retour',
      next: 'Suivant',
      done: 'Terminé',
    },
    auth: {
      login: 'Connexion',
      logout: 'Déconnexion',
      signup: "S'inscrire",
      email: 'Email',
      password: 'Mot de passe',
      forgot_password: 'Mot de passe oublié ?',
    },
    chat: {
      new_message: 'Nouveau message',
      type_message: 'Tapez un message...',
      send: 'Envoyer',
      voice_message: 'Message vocal',
      add_money: 'Ajouter de l\'argent',
    },
    treasure: {
      create: 'Créer un trésor',
      find: 'Trouver un trésor',
      unlock: 'Déverrouiller',
      claim: 'Réclamer',
      amount: 'Montant',
      location: 'Emplacement',
    },
    payment: {
      amount: 'Montant',
      currency: 'Devise',
      pay: 'Payer',
      success: 'Paiement réussi',
      failed: 'Paiement échoué',
    },
  },
  ber: {
    common: {
      loading: 'ⴰⵙⵙⴰⵔⵓ...',
      error: 'ⵜⴻⵍⵍⴰ ⵜⵓⵣⵣⵓⵜ',
      retry: 'ⴰⵍⵙ ⴰⵔⵎⴰⴷ',
      save: 'ⵅⴼⴻⴹ',
      cancel: 'ⵙⴻⵔ',
      delete: 'ⴽⴽⵙ',
      confirm: 'ⵙⴻⵏⵜⴻⵎ',
      back: 'ⴰⵖⵓⵍ',
      next: 'ⵢⴻⴹⴼⵉⵔ',
      done: 'ⵉⴽⵎⵍ',
    },
    auth: {
      login: 'ⴽⵛⴻⵎ',
      logout: 'ⴼⴼⴻⵖ',
      signup: 'ⵣⵎⵎⴻⵎ',
      email: 'ⵉⵎⴰⵢⵍ',
      password: 'ⵜⴰⵡⴰⵍⵜ ⵏ ⵓⵣⵔⴰⵢ',
      forgot_password: 'ⵜⴻⵜⵜⵓⴷ ⵜⴰⵡⴰⵍⵜ ⵏ ⵓⵣⵔⴰⵢ?',
    },
    chat: {
      new_message: 'ⵜⵓⵣⵉⵏⵜ ⵜⴰⵎⴰⵢⵏⵓⵜ',
      type_message: 'ⴰⵔⴰ ⵜⵓⵣⵉⵏⵜ...',
      send: 'ⴰⵣⵏ',
      voice_message: 'ⵜⵓⵣⵉⵏⵜ ⵜⴰⵎⵙⵍⴰⵢⵜ',
      add_money: 'ⵔⵏⵓ ⵉⴹⵔⵉⵎⵏ',
    },
    treasure: {
      create: 'ⵙⵏⵓⵍⴼⵓ ⵍⴽⵏⵣ',
      find: 'ⴰⴼ ⵍⴽⵏⵣ',
      unlock: 'ⵔⵣⵎ',
      claim: 'ⵙⵓⵜⵔ',
      amount: 'ⴰⵙⵉⴹⵏ',
      location: 'ⴰⴷⵖⴰⵔ',
    },
    payment: {
      amount: 'ⴰⵙⵉⴹⵏ',
      currency: 'ⴰⵔⵔⴰⵜⵏ',
      pay: 'ⵅⵍⵍⵚ',
      success: 'ⴰⵅⵍⵍⴰⵚ ⵢⴻⵎⵎⴻⴹ',
      failed: 'ⴰⵅⵍⵍⴰⵚ ⵓⵔ ⵢⴻⵎⵎⵉⴹ',
    },
  },
};

// Add default translations
Object.entries(defaultTranslations).forEach(([lang, translations]) => {
  i18n.addResourceBundle(lang, 'translation', translations, true, true);
});

export default i18n; 