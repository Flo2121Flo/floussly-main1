import { useTranslation } from "../lib/i18n";
import { useLocation } from "wouter";
import { useEffect, useRef, useState } from "react";
import { 
  ArrowUpRight, 
  ArrowDownLeft, 
  Plus,
  ChevronRight,
  Coins,
  ArrowDown,
  ShoppingBag,
  CreditCard,
  Coffee,
  Utensils,
  Building,
  Home,
  Car,
  Wallet,
  Phone
} from "lucide-react";
import { motion, useInView } from "framer-motion";
import { CornerAccents } from "./animations/MoroccanPatterns";
import { useAchievementContext } from "@/context/AchievementContext";
// Import AchievementType as a type instead of a value
import type { AchievementType } from "./animations/FinancialAchievements";

export interface Transaction {
  id: string;
  type: "send" | "receive" | "topup" | "withdraw";
  title: string;
  amount: number;
  currency: string;
  date: string;
  rawDate?: Date; // Optional raw date for formatting
  status: "pending" | "completed" | "failed";
  category?: string;
}

interface TransactionItemProps {
  transaction: Transaction;
  showStatus?: boolean;
  className?: string;
  compact?: boolean;
  animationDelay?: number;
}

export default function TransactionItem({ 
  transaction, 
  showStatus = true,
  className = "",
  compact = false,
  animationDelay = 0
}: TransactionItemProps) {
  const { t } = useTranslation();
  const [_, setLocation] = useLocation();
  const { showAchievement, showCelebration } = useAchievementContext();
  const [hasNewlyAppeared, setHasNewlyAppeared] = useState(false);
  const [hasTriggeredCelebration, setHasTriggeredCelebration] = useState(false);
  
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true });
  
  const { id, type, title, amount, currency, date, status, category } = transaction;
  
  // Check if this is a newly completed "receive" or "topup" transaction
  // that should trigger a celebration
  useEffect(() => {
    if (isInView && !hasNewlyAppeared) {
      setHasNewlyAppeared(true);
      
      // Check if this is a newly appeared transaction where we might want to trigger celebrations
      const isTodayTransaction = date === "tx_today_1430" || 
        (transaction.rawDate && new Date().toDateString() === transaction.rawDate.toDateString());
      
      const shouldCelebrate = isTodayTransaction && 
                            status === "completed" && 
                            !hasTriggeredCelebration &&
                            (type === "receive" || type === "topup");
      
      if (shouldCelebrate) {
        // Mark as celebrated so we don't show it again
        setHasTriggeredCelebration(true);
        
        // Wait a moment before showing achievement
        setTimeout(() => {
          // Show micro celebration based on transaction type
          if (type === "receive") {
            showCelebration("transfer", { amount });
          } else if (type === "topup") {
            showAchievement("top_up", { value: amount });
          }
        }, 800);
      }
    }
  }, [isInView, hasNewlyAppeared, type, status, date, transaction.rawDate, hasTriggeredCelebration, amount]);
  
  const navigateToTransactionDetails = () => {
    setLocation(`/transaction/${id}?type=${type}&amount=${amount}&title=${encodeURIComponent(title)}`);
  };
  
  const getCategoryIcon = () => {
    if (!category) return <ShoppingBag size={16} />;
    
    switch (category.toLowerCase()) {
      case "transfer":
        return <ArrowUpRight size={16} />;
      case "food":
        return <Utensils size={16} />;
      case "coffee":
        return <Coffee size={16} />;
      case "shopping":
        return <ShoppingBag size={16} />;
      case "transport":
        return <Car size={16} />;
      case "rent":
        return <Building size={16} />;
      case "utilities":
        return <Home size={16} />;
      case "phone":
        return <Phone size={16} />;
      case "wallet":
        return <Wallet size={16} />;
      default:
        return <ShoppingBag size={16} />;
    }
  };
  
  const getIcon = () => {
    switch (type) {
      case "send":
        return <ArrowUpRight className="text-[hsl(var(--foreground))]" size={compact ? 16 : 18} />;
      case "receive":
        return <ArrowDownLeft className="text-[hsl(var(--foreground))]" size={compact ? 16 : 18} />;
      case "topup":
        return <Plus className="text-[hsl(var(--foreground))]" size={compact ? 16 : 18} />;
      case "withdraw":
        return <ArrowDown className="text-[hsl(var(--foreground))]" size={compact ? 16 : 18} />;
    }
  };
  
  const getStatusStyles = () => {
    switch (status) {
      case "completed":
        return "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400";
      case "pending":
        return "bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400";
      case "failed":
        return "bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400";
    }
  };
  
  const getAmountStyles = () => {
    return type === "send" || type === "withdraw" 
      ? "text-rose-500 dark:text-rose-400" 
      : "text-emerald-600 dark:text-emerald-400";
  };
  
  const getAmountPrefix = () => {
    return type === "send" || type === "withdraw" ? "-" : "+";
  };
  
  const getIconBgClass = () => {
    // Different colors based on transaction type
    const baseClasses = "relative flex items-center justify-center shadow-sm";
    
    switch (type) {
      case "send":
        return `${baseClasses} bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/30 text-blue-500 dark:text-blue-300`;
      case "receive":
        return `${baseClasses} bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/30 text-emerald-500 dark:text-emerald-300`;
      case "topup":
        return `${baseClasses} bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/30 text-amber-500 dark:text-amber-300`;
      case "withdraw":
        return `${baseClasses} bg-gradient-to-br from-rose-50 to-rose-100 dark:from-rose-900/20 dark:to-rose-800/30 text-rose-500 dark:text-rose-300`;
    }
  };
  
  // Format the date string based on current language
  const formatTransactionDate = (dateStr: string) => {
    const { t } = useTranslation();
    
    // Handle our special date formats
    if (dateStr === "tx_today_1430") {
      return `${t('common.today')}, 14:30`;
    }
    
    if (dateStr === "tx_yesterday_0915") {
      return `${t('common.yesterday')}, 09:15`;
    }
    
    if (dateStr === "tx_date_1645") {
      // Format as "20 Oct, 16:45" with translated month
      const monthIndex = 9; // Oct
      const monthKeys = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
      const monthKey = monthKeys[monthIndex];
      const translatedMonth = t(`common.months.${monthKey}`);
      
      return `20 ${translatedMonth}, 16:45`;
    }
    
    // If we have rawDate, use it for formatting with translation
    if (transaction.rawDate) {
      const date = transaction.rawDate;
      
      // Format time
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      const time = `${hours}:${minutes}`;
      
      // Check if today
      const isToday = new Date().toDateString() === date.toDateString();
      if (isToday) {
        return `${t('common.today')}, ${time}`;
      }
      
      // Check if yesterday
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const isYesterday = yesterday.toDateString() === date.toDateString();
      if (isYesterday) {
        return `${t('common.yesterday')}, ${time}`;
      }
      
      // Otherwise format with day and translated month
      const day = date.getDate();
      const monthIndex = date.getMonth();
      const monthKeys = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
      const monthKey = monthKeys[monthIndex];
      const translatedMonth = t(`common.months.${monthKey}`);
      
      return `${day} ${translatedMonth}, ${time}`;
    }
    
    // Fallback for backward compatibility (should not be reached)
    return t('common.dateUnavailable');
  };

  // Convert transaction type to localized text
  const getLocalizedType = (type: string) => {
    switch (type) {
      case "send":
        return t("transaction.sentTo");
      case "receive":
        return t("transaction.receivedFrom");
      case "topup":
        return t("transaction.topUp");
      case "withdraw":
        return t("transaction.withdrawal");
      default:
        return title;
    }
  };

  // If title is a predefined transaction type, localize it
  const localizedTitle = type === "topup" ? t("transaction.topUp") : title;

  if (compact) {
    return (
      <motion.div 
        ref={ref}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, delay: animationDelay * 0.1 }}
        className={`bg-card hover:bg-muted/10 rounded-lg p-3 cursor-pointer transition-all flex items-center justify-between border border-border/40 ${className} ${status === 'completed' && date === 'tx_today_1430' ? 'relative' : ''}`}
        onClick={navigateToTransactionDetails}
      >
        {/* Show subtle moroccan-inspired highlights for new transactions */}
        {status === 'completed' && (date === 'tx_today_1430' || 
          (transaction.rawDate && new Date().toDateString() === transaction.rawDate.toDateString())) && (
          <motion.div 
            className="absolute inset-0 rounded-lg pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.15, 0] }}
            transition={{ 
              duration: 2, 
              times: [0, 0.5, 1],
              delay: 0.3,
              repeat: 2,
              repeatType: "reverse"
            }}
            style={{
              background: type === 'receive' || type === 'topup' 
                ? 'radial-gradient(circle at center, rgba(16, 185, 129, 0.25) 0%, transparent 70%)' 
                : 'none'
            }}
          />
        )}
        
        <div className="flex items-center">
          <div className={`w-8 h-8 rounded-lg ${getIconBgClass()} mr-2`}>
            {getIcon()}
          </div>
          <div>
            <p className="font-medium text-sm">{localizedTitle}</p>
          </div>
        </div>
        <div className="flex flex-col items-end">
          <p className={`font-semibold text-sm ${getAmountStyles()}`}>
            {getAmountPrefix()}{t("common.currency")} {new Intl.NumberFormat().format(amount)}
          </p>
          <p className="text-xs text-muted-foreground">{formatTransactionDate(date)}</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      ref={ref}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: animationDelay * 0.1 }}
      className={`relative overflow-hidden bg-card/80 backdrop-blur-sm hover:bg-muted/10 rounded-xl p-4 mb-3 border border-border/40 shadow-sm cursor-pointer hover:shadow-md transition-all group ${className}`}
      onClick={navigateToTransactionDetails}
    >
      {/* Button shine effect on hover */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
      
      {/* Show Moroccan corner accents for new transactions */}
      {status === 'completed' && (date === 'tx_today_1430' || 
        (transaction.rawDate && new Date().toDateString() === transaction.rawDate.toDateString())) && (
        <>
          {/* Moroccan-inspired decorative corners */}
          <CornerAccents className="opacity-10" />
          
          {/* Subtle glow for new positive transactions */}
          {(type === 'receive' || type === 'topup') && (
            <motion.div 
              className="absolute inset-0 rounded-xl pointer-events-none"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.1, 0] }}
              transition={{ 
                duration: 2, 
                times: [0, 0.5, 1],
                delay: 0.5,
                repeat: 3,
                repeatType: "reverse"
              }}
              style={{
                background: 'radial-gradient(circle at center, rgba(16, 185, 129, 0.25) 0%, transparent 70%)'
              }}
            />
          )}
        </>
      )}
      
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <div className={`w-12 h-12 rounded-xl ${getIconBgClass()} mr-4`}>
            {getIcon()}
            
            {/* Small category indicator */}
            <div className="absolute -bottom-1 -right-1 bg-background border border-border/50 rounded-full w-6 h-6 flex items-center justify-center shadow-sm">
              {getCategoryIcon()}
            </div>
            
            {/* Show subtle pulse animation for recently completed transactions */}
            {status === 'completed' && (date === 'tx_today_1430' || 
              (transaction.rawDate && new Date().toDateString() === transaction.rawDate.toDateString())) && (
              <motion.div
                className="absolute inset-0 rounded-xl"
                initial={{ opacity: 0.5, scale: 0.85 }}
                animate={{ 
                  opacity: 0, 
                  scale: 1.2,
                }}
                transition={{ 
                  duration: 1.5,
                  ease: "easeOut",
                  delay: 0.2,
                  repeat: 2,
                  repeatType: "loop"
                }}
                style={{
                  border: `2px solid ${type === 'receive' || type === 'topup' ? 'rgba(16, 185, 129, 0.4)' : 'rgba(236, 72, 153, 0.4)'}`,
                }}
              />
            )}
          </div>
          <div>
            <p className="font-semibold mb-0.5">{localizedTitle}</p>
            <div className="flex items-center text-xs text-muted-foreground">
              <span className="mr-2">{formatTransactionDate(date)}</span>
              {showStatus && (
                <span className={`${getStatusStyles()} rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide`}>
                  {t(`transaction.status.${status}`)}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center">
          <div className="text-right mr-3">
            <p className={`font-bold ${getAmountStyles()}`}>
              {getAmountPrefix()}{t("common.currency")} {new Intl.NumberFormat().format(amount)}
            </p>
            {category && (
              <p className="text-xs text-muted-foreground capitalize">
                {category}
              </p>
            )}
          </div>
          <div className="h-8 w-8 rounded-full bg-muted/40 flex items-center justify-center group-hover:bg-muted transition-colors">
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
