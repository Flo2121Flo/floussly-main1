import { useEffect } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { useTranslation } from "../lib/i18n";
import logoSrc from "@/assets/logo.svg";

export default function Splash() {
  const [_, setLocation] = useLocation();
  const { t } = useTranslation();

  useEffect(() => {
    // Automatically navigate to language selection after 2 seconds
    const timer = setTimeout(() => {
      setLocation("/language");
    }, 2000);

    return () => clearTimeout(timer);
  }, [setLocation]);

  return (
    <div className="fixed inset-0 bg-background flex flex-col items-center justify-center z-50 transition-opacity duration-500">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="w-40 h-40 mb-6 pulse"
      >
        <img src={logoSrc} alt="Floussly Logo" className="w-full h-full object-contain" />
      </motion.div>
      
      <motion.h1
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="font-poppins font-bold text-3xl text-primary mb-2"
      >
        {t("appName")}
      </motion.h1>
      
      <motion.h2
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        className="font-tajawal font-bold text-2xl text-primary mb-8"
        dir="rtl"
      >
        فلوسلي
      </motion.h2>
      
      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ delay: 0.7, duration: 0.5 }}
        className="w-16 h-1 bg-secondary rounded-full mb-8"
      />
      
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9, duration: 0.5 }}
        className="text-sm text-muted-foreground"
      >
        {t("tagline")}
      </motion.p>
    </div>
  );
}
