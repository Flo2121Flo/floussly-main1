import i18n from "i18next";
import { initReactI18next, useTranslation as useT } from "react-i18next";
import enTranslation from "./locales/en";
import frTranslation from "./locales/fr";
import arTranslation from "./locales/ar";
import berTranslation from "./locales/ber";

const resources = {
  en: { translation: enTranslation },
  fr: { translation: frTranslation },
  ar: { translation: arTranslation },
  ber: { translation: berTranslation }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: "en", // default language
    fallbackLng: "en",
    interpolation: {
      escapeValue: false // React already escapes values
    }
  });

export const useTranslation = useT;
export default i18n;
