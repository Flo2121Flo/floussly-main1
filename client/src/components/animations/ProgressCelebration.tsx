import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { BadgeCheck, Save, CreditCard, SendHorizonal, Users } from 'lucide-react';

interface ProgressCelebrationProps {
  type: 'savings' | 'payment' | 'budget' | 'transfer' | 'daret';
  amount?: number;
  target?: number;
  message?: string;
  onComplete?: () => void;
}

const ProgressCelebration: React.FC<ProgressCelebrationProps> = ({ 
  type, 
  amount, 
  target, 
  message,
  onComplete 
}) => {
  useEffect(() => {
    // Launch confetti
    const duration = 3000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 100 };

    function randomInRange(min: number, max: number) {
      return Math.random() * (max - min) + min;
    }

    const interval: NodeJS.Timeout = setInterval(() => {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      
      // Use moroccan flag colors
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
        colors: ['#c1272d', '#006233'], // Moroccan flag colors
      });
      
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
        colors: ['#c1272d', '#006233'], // Moroccan flag colors
      });
    }, 250);

    // Auto-dismiss after a while
    const timer = setTimeout(() => {
      if (onComplete) onComplete();
    }, 4000);

    return () => {
      clearInterval(interval);
      clearTimeout(timer);
    };
  }, [onComplete]);

  // Get the content based on the type
  const getContent = () => {
    switch (type) {
      case 'savings':
        return {
          icon: Save,
          title: 'Savings Goal Reached!',
          description: message || `You've saved ${amount} MAD${target ? ` of your ${target} MAD goal` : ''}!`,
          colorClass: 'bg-green-500'
        };
      case 'payment':
        return {
          icon: CreditCard,
          title: 'Payment Complete!',
          description: message || `Your payment of ${amount} MAD has been processed successfully.`,
          colorClass: 'bg-blue-500'
        };
      case 'budget':
        return {
          icon: BadgeCheck,
          title: 'Budget Achievement!',
          description: message || "You've stayed under budget this month!",
          colorClass: 'bg-violet-500'
        };
      case 'transfer':
        return {
          icon: SendHorizonal,
          title: 'Transfer Successful!',
          description: message || `You've successfully transferred ${amount} MAD.`,
          colorClass: 'bg-primary'
        };
      case 'daret':
        return {
          icon: Users,
          title: 'Daret Contribution Made!',
          description: message || `You've contributed ${amount} MAD to your Daret.`,
          colorClass: 'bg-amber-500'
        };
      default:
        return {
          icon: BadgeCheck,
          title: 'Success!',
          description: message || 'Operation completed successfully.',
          colorClass: 'bg-primary'
        };
    }
  };

  const { icon: Icon, title, description, colorClass } = getContent();

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <div className="relative w-full max-w-md mx-4 flex flex-col items-center">
          {/* Animated decoration - Moroccan pattern */}
          <svg width="300" height="300" viewBox="0 0 300 300" fill="none" className="absolute opacity-20">
            <motion.path
              d="M150 0L180 120H300L200 180L230 300L150 230L70 300L100 180L0 120H120L150 0Z"
              stroke="url(#pattern-gradient)"
              strokeWidth="4"
              fill="none"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 2, ease: "easeInOut" }}
            />
            <defs>
              <linearGradient id="pattern-gradient" x1="0" y1="0" x2="300" y2="300" gradientUnits="userSpaceOnUse">
                <stop stopColor="#c1272d" />
                <stop offset="1" stopColor="#006233" />
              </linearGradient>
            </defs>
          </svg>
          
          {/* Icon */}
          <motion.div
            className={`${colorClass} h-24 w-24 rounded-full flex items-center justify-center text-white z-10 mb-6 shadow-lg`}
            initial={{ scale: 0 }}
            animate={{ scale: [0, 1.2, 1] }}
            transition={{ 
              times: [0, 0.6, 1],
              duration: 0.8,
              ease: "backOut" 
            }}
          >
            <Icon className="h-12 w-12" />
          </motion.div>
          
          {/* Text content */}
          <motion.div 
            className="bg-card border shadow-lg rounded-lg p-6 text-center w-full z-10"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <motion.h2 
              className="text-2xl font-bold mb-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              {title}
            </motion.h2>
            <motion.p 
              className="text-muted-foreground"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
            >
              {description}
            </motion.p>
          </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ProgressCelebration;