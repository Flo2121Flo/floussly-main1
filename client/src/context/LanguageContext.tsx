import { createContext, ReactNode, useContext, useState, useEffect } from "react";
import { useTranslation } from "../lib/i18n";

type Language = "en" | "fr" | "ar" | "ber";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  isRtl: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en");
  const { i18n } = useTranslation();
  const isRtl = language === "ar";
  
  // Load language from localStorage on init
  useEffect(() => {
    const savedLanguage = localStorage.getItem("floussly-language");
    if (savedLanguage && ["en", "fr", "ar", "ber"].includes(savedLanguage)) {
      setLanguageState(savedLanguage as Language);
      i18n.changeLanguage(savedLanguage);
      updateDocumentAttributes(savedLanguage as Language);
    }
  }, [i18n]);
  
  const updateDocumentAttributes = (lang: Language) => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    
    // Update body class for RTL support
    if (lang === "ar") {
      document.body.classList.add("rtl");
      document.body.classList.remove("ltr");
    } else {
      document.body.classList.add("ltr");
      document.body.classList.remove("rtl");
    }
  };
  
  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    i18n.changeLanguage(lang);
    localStorage.setItem("floussly-language", lang);
    updateDocumentAttributes(lang);
  };
  
  return (
    <LanguageContext.Provider value={{ language, setLanguage, isRtl }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
