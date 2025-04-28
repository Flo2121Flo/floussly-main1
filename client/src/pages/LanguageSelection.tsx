import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { useTranslation } from "../lib/i18n";
import { useLanguage } from "../context/LanguageContext";
import LanguageSelector from "@/components/LanguageSelector";

export default function LanguageSelection() {
  const [_, setLocation] = useLocation();
  const { t } = useTranslation();
  const { setLanguage } = useLanguage();

  const handleLanguageSelect = (lang: string) => {
    setLanguage(lang as "en" | "fr" | "ar" | "ber");
    setLocation("/login");
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
  };

  return (
    <div className="fixed inset-0 bg-background flex flex-col items-center justify-center z-40">
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="w-full max-w-md px-6"
      >
        <motion.h2 
          variants={item}
          className="font-poppins font-bold text-2xl text-primary mb-8 text-center"
        >
          {t("settings.language")}
        </motion.h2>
        
        <div className="grid grid-cols-2 gap-4 w-full max-w-xs mx-auto">
          <motion.button 
            variants={item}
            className="bg-card py-4 px-6 rounded-xl flex flex-col items-center justify-center card-shadow hover:bg-muted transition duration-200"
            onClick={() => handleLanguageSelect("en")}
          >
            <span className="text-2xl mb-2">🇬🇧</span>
            <span className="text-sm font-medium">English</span>
          </motion.button>
          
          <motion.button 
            variants={item}
            className="bg-card py-4 px-6 rounded-xl flex flex-col items-center justify-center card-shadow hover:bg-muted transition duration-200"
            onClick={() => handleLanguageSelect("fr")}
          >
            <span className="text-2xl mb-2">🇫🇷</span>
            <span className="text-sm font-medium">Français</span>
          </motion.button>
          
          <motion.button 
            variants={item}
            className="bg-card py-4 px-6 rounded-xl flex flex-col items-center justify-center card-shadow hover:bg-muted transition duration-200"
            onClick={() => handleLanguageSelect("ar")}
          >
            <span className="text-2xl mb-2">🇲🇦</span>
            <span className="text-sm font-medium font-tajawal">العربية</span>
          </motion.button>
          
          <motion.button 
            variants={item}
            className="bg-card py-4 px-6 rounded-xl flex flex-col items-center justify-center card-shadow hover:bg-muted transition duration-200"
            onClick={() => handleLanguageSelect("ber")}
          >
            <span className="text-2xl mb-2">🏳️</span>
            <span className="text-sm font-medium">ⵜⴰⵎⴰⵣⵉⵖⵜ</span>
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}
