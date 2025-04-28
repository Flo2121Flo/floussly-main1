import { useWallet } from "../hooks/use-wallet";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { ArrowUpCircle, ArrowDownCircle, LineChart, CreditCard, Share2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { motion } from "framer-motion";

export default function WalletCard() {
  const { wallet, topUp, withdraw } = useWallet();
  const { t } = useTranslation();
  const { toast } = useToast();
  const [_, setLocation] = useLocation();
  
  // Animation variants for staggered animations
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { type: "spring", stiffness: 300, damping: 24 }
    }
  };
  
  const handleTopUp = () => {
    setLocation("/payment-page");
  };
  
  const handleWithdraw = () => {
    setLocation("/withdraw");
  };
  
  const handleGraphClick = () => {
    setLocation("/finance-overview");
  };
  
  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="bg-gradient-to-br from-primary/95 via-primary to-primary/90 rounded-3xl p-0 text-primary-foreground overflow-hidden relative shadow-xl"
      style={{
        boxShadow: "0 10px 40px rgba(0, 104, 74, 0.2), 0 4px 12px rgba(0, 104, 74, 0.15)"
      }}
      whileHover={{ 
        y: -5,
        transition: { duration: 0.3 }
      }}
    >
      {/* Enhanced glass morphism card effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/15 to-white/5 backdrop-blur-[2px]"></div>
      
      {/* Improved decorative elements */}
      <div className="absolute -top-20 -right-20 w-60 h-60 bg-white/10 rounded-full opacity-30 blur-md"></div>
      <div className="absolute -bottom-20 -left-10 w-40 h-40 bg-white/10 rounded-full opacity-30 blur-sm"></div>
      
      {/* Animated decorative elements */}
      <motion.div 
        className="absolute top-1/4 left-1/4 w-20 h-20 bg-white/10 rounded-full opacity-20 blur-xl"
        animate={{ 
          x: [0, 10, -5, 0],
          y: [0, -5, 10, 0]
        }}
        transition={{ 
          duration: 8, 
          repeat: Infinity,
          repeatType: "mirror" 
        }}
      ></motion.div>
      <motion.div 
        className="absolute bottom-1/3 right-1/5 w-16 h-16 bg-white/10 rounded-full opacity-20 blur-lg"
        animate={{ 
          x: [0, -15, 5, 0],
          y: [0, 8, -10, 0]
        }}
        transition={{ 
          duration: 12, 
          repeat: Infinity,
          repeatType: "mirror" 
        }}
      ></motion.div>
      
      {/* Subtle patterns */}
      <div className="absolute inset-0 opacity-5">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <pattern id="diagonalPattern" width="20" height="20" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <line x1="0" y1="0" x2="0" y2="20" stroke="white" strokeWidth="1" />
          </pattern>
          <rect width="100%" height="100%" fill="url(#diagonalPattern)" />
        </svg>
      </div>
      
      <div className="relative z-10">
        {/* Card header with improved curved design */}
        <div className="px-6 pt-6 pb-5">
          <div className="flex justify-between items-start w-full mb-6">
            <div>
              <p className="text-sm text-white/80 mb-1 font-medium">{t("wallet.availableBalance")}</p>
              <motion.h3 
                className="font-bold text-3xl flex items-center text-white tracking-tight"
                initial={{ scale: 0.95, opacity: 0.8 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <span className="text-xl mr-1">{t("common.currency")}</span>
                <span>{new Intl.NumberFormat().format(wallet.balance)}</span>
              </motion.h3>
              
              {/* Growth indicator */}
              <motion.div 
                className="flex items-center mt-1.5 text-xs text-emerald-200 bg-emerald-900/30 rounded-full px-2 py-0.5 w-fit"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-1">
                  <path d="M7 17L17 7M17 7H8M17 7V16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                2.4% this week
              </motion.div>
            </div>
            
            {/* Enhanced Logo Animation */}
            <motion.div 
              className="w-16 h-16 bg-gradient-to-br from-secondary/80 to-secondary/90 rounded-full flex items-center justify-center shadow-inner overflow-hidden p-1 border border-white/20"
              animate={{ 
                boxShadow: ["0 0 20px rgba(255,255,255,0.2)", "0 0 10px rgba(255,255,255,0.1)", "0 0 20px rgba(255,255,255,0.2)"]
              }}
              transition={{ 
                duration: 3,
                repeat: Infinity,
                repeatType: "reverse" 
              }}
              whileHover={{ scale: 1.05 }}
            >
              {/* Improved Floussly logo SVG */}
              <motion.svg 
                width="100%" 
                height="100%" 
                viewBox="0 0 100 100" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
                animate={{ rotate: 360 }}
                transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
              >
                {/* Green circle with people */}
                <g>
                  {/* Individual circles and connectors representing people around the circle */}
                  <circle cx="50" cy="15" r="5" fill="hsl(var(--primary))" />
                  <path d="M62 18 L70 10" stroke="hsl(var(--primary))" strokeWidth="5" strokeLinecap="round" />
                  
                  <circle cx="75" cy="25" r="5" fill="hsl(var(--primary))" />
                  <path d="M82 37 L90 32" stroke="hsl(var(--primary))" strokeWidth="5" strokeLinecap="round" />
                  
                  <circle cx="85" cy="50" r="5" fill="hsl(var(--primary))" />
                  <path d="M82 63 L90 68" stroke="hsl(var(--primary))" strokeWidth="5" strokeLinecap="round" />
                  
                  <circle cx="75" cy="75" r="5" fill="hsl(var(--primary))" />
                  <path d="M62 82 L70 90" stroke="hsl(var(--primary))" strokeWidth="5" strokeLinecap="round" />
                  
                  <circle cx="50" cy="85" r="5" fill="hsl(var(--primary))" />
                  <path d="M38 82 L30 90" stroke="hsl(var(--primary))" strokeWidth="5" strokeLinecap="round" />
                  
                  <circle cx="25" cy="75" r="5" fill="hsl(var(--primary))" />
                  <path d="M18 63 L10 68" stroke="hsl(var(--primary))" strokeWidth="5" strokeLinecap="round" />
                  
                  <circle cx="15" cy="50" r="5" fill="hsl(var(--primary))" />
                  <path d="M18 37 L10 32" stroke="hsl(var(--primary))" strokeWidth="5" strokeLinecap="round" />
                  
                  <circle cx="25" cy="25" r="5" fill="hsl(var(--primary))" />
                  <path d="M38 18 L30 10" stroke="hsl(var(--primary))" strokeWidth="5" strokeLinecap="round" />
                  
                  {/* Gold circle in the center with enhanced detailing */}
                  <motion.circle 
                    cx="50" 
                    cy="50" 
                    r="25" 
                    fill="hsl(var(--secondary))"
                    animate={{ scale: [1, 1.03, 1] }}
                    transition={{ 
                      duration: 3, 
                      repeat: Infinity,
                      repeatType: "reverse" 
                    }}
                  />
                  
                  {/* Enhanced coin details */}
                  <circle cx="50" cy="50" r="22" fill="hsl(var(--secondary))" stroke="#C09217" strokeWidth="1" />
                  <circle cx="50" cy="50" r="19" fill="#E8B423" stroke="#C09217" strokeWidth="0.5" opacity="0.7" />
                  
                  {/* Shine effect */}
                  <ellipse cx="40" cy="40" rx="12" ry="10" fill="white" opacity="0.2" />
                  
                  {/* د.م (Dirham) text in the center - perfectly centered */}
                  <text 
                    x="50" 
                    y="50" 
                    fontFamily="Arial, sans-serif" 
                    fontSize="18" 
                    fontWeight="bold" 
                    fill="#004D40" 
                    textAnchor="middle"
                    dominantBaseline="central"
                    letterSpacing="1">د.م</text>
                </g>
              </motion.svg>
            </motion.div>
          </div>
          
          {/* Wallet stats mini-section with enhanced animation */}
          <motion.div 
            variants={containerVariants}
            className="mt-1 mb-5 grid grid-cols-2 gap-3"
          >
            <motion.div 
              variants={itemVariants}
              whileHover={{ scale: 1.03, transition: { duration: 0.2 } }}
              className="bg-white/10 hover:bg-white/15 transition-colors rounded-xl p-3 backdrop-blur-sm border border-white/5 shadow-sm"
            >
              <div className="flex items-center text-xs text-white/80 mb-1.5">
                <div className="w-5 h-5 rounded-full bg-white/15 flex items-center justify-center mr-2">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2V6M12 18V22M4.93 4.93L7.76 7.76M16.24 16.24L19.07 19.07M2 12H6M18 12H22M4.93 19.07L7.76 16.24M16.24 7.76L19.07 4.93" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <span className="font-medium">{t("wallet.stats.monthlySpending")}</span>
              </div>
              <p className="text-white text-sm font-semibold flex items-center">
                <span className="text-xs mr-1">{t("common.currency")}</span>
                <span>{(2125).toLocaleString()}</span>
              </p>
              <div className="mt-1 h-1 w-full bg-white/10 rounded-full overflow-hidden">
                <div className="h-full w-3/4 bg-gradient-to-r from-emerald-300 to-emerald-400 rounded-full"></div>
              </div>
            </motion.div>
            
            <motion.div 
              variants={itemVariants}
              whileHover={{ scale: 1.03, transition: { duration: 0.2 } }}
              className="bg-white/10 hover:bg-white/15 transition-colors rounded-xl p-3 backdrop-blur-sm border border-white/5 shadow-sm"
            >
              <div className="flex items-center text-xs text-white/80 mb-1.5">
                <div className="w-5 h-5 rounded-full bg-white/15 flex items-center justify-center mr-2">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M16 18V20M12 18V22M8 18V20M3 10H21M5 21H19C20.1046 21 21 20.1046 21 19V7C21 5.89543 20.1046 5 19 5H5C3.89543 5 3 5.89543 3 7V19C3 20.1046 3.89543 21 5 21Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <span className="font-medium">{t("wallet.stats.nextDaretPayment")}</span>
              </div>
              <div className="flex justify-between items-center">
                <p className="text-white text-sm font-semibold">15 {t("common.months.may")}</p>
                <div className="text-xs bg-white/20 rounded-full px-2 py-0.5 text-white/90">
                  {t("wallet.stats.daysLeft", { days: "7" })}
                </div>
              </div>
            </motion.div>
          </motion.div>
          
          {/* Financial summary button */}
          <div className="mt-4 flex justify-end">
            <Button 
              variant="ghost" 
              size="sm" 
              className="bg-white/10 hover:bg-white/20 text-xs text-white/90 hover:text-white rounded-lg px-3 backdrop-blur-sm"
              onClick={handleGraphClick}
            >
              <LineChart className="h-3.5 w-3.5 mr-1.5" />
              {t("wallet.viewTrends")}
            </Button>
          </div>
        </div>
        
        {/* Quick Action Buttons with enhanced styling */}
        <div className="px-3 py-4 backdrop-blur-sm bg-black/10 border-t border-white/10 grid grid-cols-3 gap-3">
          <Button 
            variant="ghost" 
            className="bg-white/15 hover:bg-white/25 text-white rounded-xl flex flex-col items-center py-3 h-auto shadow-md hover:shadow-lg transition-all overflow-hidden group relative"
            onClick={handleTopUp}
          >
            {/* Button shine effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
            
            <ArrowUpCircle className="h-5 w-5 mb-1.5 group-hover:text-secondary transition-colors" />
            <span className="text-xs font-semibold">{t("wallet.topUp")}</span>
          </Button>
          
          <Button 
            variant="ghost" 
            className="bg-white/15 hover:bg-white/25 text-white rounded-xl flex flex-col items-center py-3 h-auto shadow-md hover:shadow-lg transition-all overflow-hidden group relative"
            onClick={handleWithdraw}
          >
            {/* Button shine effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
            
            <ArrowDownCircle className="h-5 w-5 mb-1.5 group-hover:text-secondary transition-colors" />
            <span className="text-xs font-semibold">{t("wallet.withdraw")}</span>
          </Button>
          
          <Button 
            variant="ghost" 
            className="bg-white/15 hover:bg-white/25 text-white rounded-xl flex flex-col items-center py-3 h-auto shadow-md hover:shadow-lg transition-all overflow-hidden group relative"
            onClick={() => setLocation("/transactions")}
          >
            {/* Button shine effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
            
            <Share2 className="h-5 w-5 mb-1.5 group-hover:text-secondary transition-colors" />
            <span className="text-xs font-semibold">{t("wallet.send")}</span>
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
