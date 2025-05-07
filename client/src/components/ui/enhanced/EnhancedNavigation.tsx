import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/lib/i18n';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Button } from '../button';

// Enhanced Back Button with animation
export const EnhancedBackButton = ({
  onClick,
  className,
  label,
}: {
  onClick: () => void;
  className?: string;
  label?: string;
}) => {
  const { t } = useTranslation();
  
  return (
    <motion.div
      whileHover={{ x: -2 }}
      whileTap={{ scale: 0.98 }}
    >
      <Button
        variant="ghost"
        className={cn(
          "flex items-center text-muted-foreground p-0 hover:bg-transparent",
          className
        )}
        onClick={onClick}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        {label || t("nav.back")}
      </Button>
    </motion.div>
  );
};

// Enhanced Navigation Link with animation
export const EnhancedNavLink = ({
  href,
  label,
  icon: Icon,
  active,
  className,
}: {
  href: string;
  label: string;
  icon?: React.ElementType;
  active?: boolean;
  className?: string;
}) => {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <Button
        variant={active ? "default" : "ghost"}
        className={cn(
          "w-full justify-start gap-2 min-h-[44px]",
          className
        )}
        asChild
      >
        <a href={href}>
          {Icon && <Icon className="h-4 w-4" />}
          {label}
        </a>
      </Button>
    </motion.div>
  );
};

// Enhanced Tab Navigation
export const EnhancedTabs = ({
  tabs,
  activeTab,
  onChange,
  className,
}: {
  tabs: { id: string; label: string }[];
  activeTab: string;
  onChange: (tabId: string) => void;
  className?: string;
}) => {
  return (
    <div className={cn("flex gap-2 p-1 bg-muted rounded-lg", className)}>
      {tabs.map((tab) => (
        <motion.button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={cn(
            "flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors",
            activeTab === tab.id
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {tab.label}
        </motion.button>
      ))}
    </div>
  );
};

// Enhanced Breadcrumb Navigation
export const EnhancedBreadcrumbs = ({
  items,
  className,
}: {
  items: { label: string; href?: string }[];
  className?: string;
}) => {
  return (
    <nav className={cn("flex items-center gap-2 text-sm", className)}>
      {items.map((item, index) => (
        <div key={index} className="flex items-center">
          {index > 0 && (
            <ArrowRight className="h-4 w-4 mx-2 text-muted-foreground" />
          )}
          {item.href ? (
            <motion.a
              href={item.href}
              className="text-muted-foreground hover:text-foreground"
              whileHover={{ x: 2 }}
            >
              {item.label}
            </motion.a>
          ) : (
            <span className="text-foreground">{item.label}</span>
          )}
        </div>
      ))}
    </nav>
  );
};

// Enhanced Bottom Navigation
export const EnhancedBottomNav = ({
  items,
  activeItem,
  onChange,
  className,
}: {
  items: { id: string; label: string; icon: React.ElementType }[];
  activeItem: string;
  onChange: (itemId: string) => void;
  className?: string;
}) => {
  return (
    <motion.nav
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      className={cn(
        "fixed bottom-0 left-0 right-0 bg-background border-t",
        className
      )}
    >
      <div className="flex items-center justify-around p-2">
        {items.map((item) => (
          <motion.button
            key={item.id}
            onClick={() => onChange(item.id)}
            className={cn(
              "flex flex-col items-center gap-1 p-2 rounded-lg",
              activeItem === item.id
                ? "text-primary"
                : "text-muted-foreground"
            )}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <item.icon className="h-5 w-5" />
            <span className="text-xs">{item.label}</span>
          </motion.button>
        ))}
      </div>
    </motion.nav>
  );
}; 