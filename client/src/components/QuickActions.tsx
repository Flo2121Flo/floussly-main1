import { useTranslation } from "../lib/i18n";
import { useLocation } from "wouter";
import { 
  SendIcon, 
  QrCodeIcon, 
  UsersIcon, 
  StoreIcon,
  Building2 as BankIcon
} from "lucide-react";
import { motion } from "framer-motion";

export default function QuickActions() {
  const { t } = useTranslation();
  const [_, setLocation] = useLocation();
  
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.07,
        delayChildren: 0.2
      }
    }
  };
  
  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { 
      y: 0, 
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 260,
        damping: 20
      }
    }
  };
  
  const actions = [
    { 
      id: "send", 
      label: t("actions.send"), 
      icon: SendIcon, 
      color: "blue", 
      path: "/send-money",
      gradient: "from-blue-900 to-blue-800",
      bgColor: "bg-blue-950",
      shadowColor: "shadow-blue-900/30",
      iconColor: "text-blue-400"
    },
    { 
      id: "scan", 
      label: t("actions.scan"), 
      icon: QrCodeIcon, 
      color: "green", 
      path: "/qr-code",
      gradient: "from-emerald-900 to-emerald-800",
      bgColor: "bg-emerald-950",
      shadowColor: "shadow-emerald-900/30",
      iconColor: "text-emerald-400"
    },
    { 
      id: "daret", 
      label: t("actions.daret"), 
      icon: UsersIcon, 
      color: "purple", 
      path: "/daret",
      gradient: "from-purple-900 to-purple-800",
      bgColor: "bg-purple-950", 
      shadowColor: "shadow-purple-900/30",
      iconColor: "text-purple-400"
    },
    { 
      id: "agents", 
      label: t("actions.agents"), 
      icon: StoreIcon, 
      color: "orange", 
      path: "/agent-map",
      gradient: "from-amber-900 to-amber-800",
      bgColor: "bg-amber-950",
      shadowColor: "shadow-amber-900/30",
      iconColor: "text-amber-400"
    },
    { 
      id: "banks", 
      label: t("actions.banks"), 
      icon: BankIcon, 
      color: "teal", 
      path: "/bank-accounts",
      gradient: "from-teal-900 to-teal-800",
      bgColor: "bg-teal-950",
      shadowColor: "shadow-teal-900/30",
      iconColor: "text-teal-400"
    }
  ];
  
  return (
    <div className="mb-4">
      <div className="flex items-center gap-2 mb-4 px-2">
        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-green-500/20 to-green-600/5 flex items-center justify-center shadow-sm">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9 6L20 6M20 6L16 2M20 6L16 10M3 12H14M14 12L10 8M14 12L10 16M9 18H20M20 18L16 14M20 18L16 22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <h3 className="font-medium text-base tracking-tight text-gray-200">{t("home.quickActions")}</h3>
      </div>
      
      <motion.div 
        className="grid grid-cols-5 gap-4 px-2"
        variants={container}
        initial="hidden"
        animate="show"
      >
        {actions.map((action) => (
          <motion.button 
            key={action.id}
            className="flex flex-col items-center group" 
            onClick={() => setLocation(action.path)}
            variants={item}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <div 
              className={`w-14 h-14 rounded-xl ${action.bgColor} flex items-center justify-center mb-2 shadow-md relative overflow-hidden group-hover:shadow-lg transition-all`} 
              aria-hidden="true"
            >
              {/* Button shine effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
              
              {action.icon && (
                <motion.div 
                  className={`${action.iconColor}`}
                  whileHover={{ rotate: [0, -10, 10, -5, 0] }}
                  transition={{ duration: 0.5 }}
                >
                  <action.icon className="h-6 w-6" />
                </motion.div>
              )}
            </div>
            <span className="text-xs font-medium text-center text-gray-300 group-hover:text-gray-100 transition-colors">
              {action.label}
            </span>
          </motion.button>
        ))}
      </motion.div>
    </div>
  );
}
