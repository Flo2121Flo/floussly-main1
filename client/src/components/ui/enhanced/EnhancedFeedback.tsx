import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/lib/i18n';
import { AlertCircle, CheckCircle2, Info, XCircle } from 'lucide-react';
import { Button } from '../button';

// Enhanced Toast Component
export const EnhancedToast = ({
  type = 'info',
  title,
  description,
  action,
  onClose,
}: {
  type?: 'info' | 'success' | 'warning' | 'error';
  title: string;
  description?: string;
  action?: { label: string; onClick: () => void };
  onClose?: () => void;
}) => {
  const icons = {
    info: Info,
    success: CheckCircle2,
    warning: AlertCircle,
    error: XCircle,
  };
  
  const colors = {
    info: 'bg-blue-500',
    success: 'bg-green-500',
    warning: 'bg-yellow-500',
    error: 'bg-destructive',
  };
  
  const Icon = icons[type];
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      className={cn(
        "rounded-lg shadow-lg p-4 flex items-start gap-3",
        type === 'info' && "bg-blue-50 dark:bg-blue-950",
        type === 'success' && "bg-green-50 dark:bg-green-950",
        type === 'warning' && "bg-yellow-50 dark:bg-yellow-950",
        type === 'error' && "bg-destructive/10"
      )}
    >
      <Icon className={cn(
        "h-5 w-5 mt-0.5",
        type === 'info' && "text-blue-500",
        type === 'success' && "text-green-500",
        type === 'warning' && "text-yellow-500",
        type === 'error' && "text-destructive"
      )} />
      <div className="flex-1">
        <h3 className="font-medium">{title}</h3>
        {description && (
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
        )}
        {action && (
          <div className="mt-3">
            <Button
              variant="outline"
              size="sm"
              onClick={action.onClick}
              className={cn(
                type === 'info' && "text-blue-500 hover:text-blue-600",
                type === 'success' && "text-green-500 hover:text-green-600",
                type === 'warning' && "text-yellow-500 hover:text-yellow-600",
                type === 'error' && "text-destructive hover:text-destructive/90"
              )}
            >
              {action.label}
            </Button>
          </div>
        )}
      </div>
      {onClose && (
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 -mt-1 -mr-1"
          onClick={onClose}
        >
          <XCircle className="h-4 w-4" />
        </Button>
      )}
    </motion.div>
  );
};

// Enhanced Progress Indicator
export const EnhancedProgress = ({
  value,
  max = 100,
  label,
  className,
}: {
  value: number;
  max?: number;
  label?: string;
  className?: string;
}) => {
  const percentage = (value / max) * 100;
  
  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <div className="flex justify-between text-sm">
          <span>{label}</span>
          <span>{Math.round(percentage)}%</span>
        </div>
      )}
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="h-full bg-primary"
        />
      </div>
    </div>
  );
};

// Enhanced Loading Spinner
export const EnhancedSpinner = ({
  size = 'default',
  className,
}: {
  size?: 'sm' | 'default' | 'lg';
  className?: string;
}) => {
  const sizes = {
    sm: 'h-4 w-4',
    default: 'h-6 w-6',
    lg: 'h-8 w-8',
  };
  
  return (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      className={cn(sizes[size], className)}
    >
      <svg
        className="h-full w-full text-primary"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
    </motion.div>
  );
};

// Enhanced Badge with animation
export const EnhancedBadge = ({
  children,
  variant = 'default',
  className,
}: {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'error';
  className?: string;
}) => {
  return (
    <motion.span
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        variant === 'default' && "bg-primary/10 text-primary",
        variant === 'success' && "bg-green-500/10 text-green-500",
        variant === 'warning' && "bg-yellow-500/10 text-yellow-500",
        variant === 'error' && "bg-destructive/10 text-destructive",
        className
      )}
    >
      {children}
    </motion.span>
  );
}; 