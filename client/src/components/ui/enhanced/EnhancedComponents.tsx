import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';
import { Button } from '../button';
import { Card } from '../card';
import { useTranslation } from '@/lib/i18n';

// Enhanced Button with touch feedback and loading state
export const EnhancedButton = ({
  children,
  loading,
  className,
  ...props
}: {
  children: React.ReactNode;
  loading?: boolean;
  className?: string;
  [key: string]: any;
}) => {
  return (
    <motion.div
      whileTap={{ scale: 0.98 }}
      className="inline-block"
    >
      <Button
        className={cn(
          "min-h-[44px] min-w-[44px] relative",
          loading && "opacity-80",
          className
        )}
        disabled={loading}
        {...props}
      >
        <AnimatePresence>
          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center bg-background/50"
            >
              <Loader2 className="h-4 w-4 animate-spin" />
            </motion.div>
          )}
        </AnimatePresence>
        <span className={cn(loading && "opacity-0")}>{children}</span>
      </Button>
    </motion.div>
  );
};

// Enhanced Card with hover effect and touch feedback
export const EnhancedCard = ({
  children,
  className,
  interactive = false,
  ...props
}: {
  children: React.ReactNode;
  className?: string;
  interactive?: boolean;
  [key: string]: any;
}) => {
  const Component = interactive ? motion.div : Card;
  const componentProps = interactive
    ? {
        whileHover: { scale: 1.01 },
        whileTap: { scale: 0.99 },
        className: cn(
          "cursor-pointer transition-shadow hover:shadow-md",
          className
        ),
        ...props,
      }
    : { className, ...props };

  return <Component {...componentProps}>{children}</Component>;
};

// Empty State Component
export const EmptyState = ({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  action?: React.ReactNode;
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-12 px-4 text-center"
    >
      <Icon className="h-12 w-12 text-muted-foreground/50 mb-4" />
      <h3 className="text-lg font-medium mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground mb-6">{description}</p>
      {action}
    </motion.div>
  );
};

// Loading State Component
export const LoadingState = ({
  message,
  className,
}: {
  message?: string;
  className?: string;
}) => {
  const { t } = useTranslation();
  return (
    <div className={cn("flex flex-col items-center justify-center py-8", className)}>
      <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
      <p className="text-sm text-muted-foreground">
        {message || t("common.loading")}
      </p>
    </div>
  );
};

// Error State Component
export const ErrorState = ({
  title,
  description,
  retry,
}: {
  title: string;
  description: string;
  retry?: () => void;
}) => {
  const { t } = useTranslation();
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-12 px-4 text-center"
    >
      <div className="h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
        <span className="text-destructive text-2xl">!</span>
      </div>
      <h3 className="text-lg font-medium mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground mb-6">{description}</p>
      {retry && (
        <EnhancedButton onClick={retry} variant="outline">
          {t("common.retry")}
        </EnhancedButton>
      )}
    </motion.div>
  );
};

// Confirmation Dialog Component
export const ConfirmationDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText,
  cancelText,
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
}) => {
  const { t } = useTranslation();
  
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="fixed left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%] w-full max-w-md p-6"
          >
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-2">{title}</h2>
              <p className="text-sm text-muted-foreground mb-6">{description}</p>
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={onClose}>
                  {cancelText || t("common.cancel")}
                </Button>
                <Button variant="destructive" onClick={onConfirm}>
                  {confirmText || t("common.confirm")}
                </Button>
              </div>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}; 