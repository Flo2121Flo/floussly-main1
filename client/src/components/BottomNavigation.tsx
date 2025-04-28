import { Link, useLocation } from "wouter";
import { Home, BarChart3, User, ArrowUpDown, QrCode, Receipt, Wallet } from "lucide-react";
import { useTranslation } from "../lib/i18n";
import { motion } from "framer-motion";

export default function BottomNavigation() {
  const [location, navigate] = useLocation();
  const { t } = useTranslation();
  
  const navItems = [
    { path: "/", label: t("nav.home"), icon: Home },
    { path: "/transactions", label: t("nav.transactions"), icon: Receipt },
    { path: "/qr-code", label: t("nav.qr"), icon: QrCode, isPrimary: true },
    { path: "/finance-overview", label: t("nav.finance"), icon: BarChart3 },
    { path: "/profile", label: t("nav.profile"), icon: User }
  ];
  
  // Function to handle clicks on navigation items
  const handleNavClick = (path: string) => {
    navigate(path);
  };
  
  return (
    <motion.div 
      className="fixed bottom-0 left-0 right-0 bg-card/90 backdrop-blur-md border-t border-border py-3 px-4 flex justify-between max-w-md mx-auto z-50 shadow-[0_-5px_15px_rgba(0,0,0,0.03)]"
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.3, delay: 0.2 }}
    >
      {navItems.map((item, index) => {
        // Determine if current path matches this nav item
        const isActive = location === item.path ||
          (item.path === "/finance-overview" && (location === "/finance" || location.includes("finance") || location.includes("budget"))) ||
          (item.path === "/profile" && (location === "/settings" || location.includes("profile") || location.includes("account"))) ||
          (item.path === "/transactions" && location.includes("transaction"));
          
        const Icon = item.icon;
        
        if (item.isPrimary) {
          return (
            <div key={item.path} className="flex-1 flex justify-center -mt-8 relative">
              <motion.div 
                className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-primary/90 text-primary-foreground flex items-center justify-center shadow-lg cursor-pointer group overflow-hidden border-4 border-background"
                onClick={() => handleNavClick(item.path)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                initial={{ y: 50 }}
                animate={{ y: 0 }}
                transition={{ delay: 0.4, duration: 0.3 }}
              >

                <motion.div
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-1.5 rounded-full border border-white/10 opacity-50"
                ></motion.div>
                
                <Icon className="text-xl h-7 w-7" />
              </motion.div>
            </div>
          );
        }
        
        return (
          <motion.div 
            key={item.path} 
            className="flex flex-col items-center justify-center cursor-pointer relative flex-1"
            onClick={() => handleNavClick(item.path)}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 * index, duration: 0.3 }}
            whileHover={{ y: -2 }}
            whileTap={{ y: 0 }}
          >
            {isActive && (
              <motion.div
                layoutId="nav-indicator"
                className="absolute -top-3 w-1 h-1 rounded-full bg-primary"
                transition={{ duration: 0.3 }}
              />
            )}
            <div className={`flex items-center justify-center w-10 h-10 rounded-xl ${isActive ? 'bg-primary/10' : 'bg-transparent'} transition-colors`}>
              <Icon
                className={`${isActive ? "text-primary" : "text-muted-foreground"} transition-colors`}
                size={isActive ? 22 : 20}
              />
            </div>
            <span 
              className={`text-xs mt-1 font-medium ${isActive ? "text-primary" : "text-muted-foreground"} transition-colors`}
            >
              {item.label}
            </span>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
