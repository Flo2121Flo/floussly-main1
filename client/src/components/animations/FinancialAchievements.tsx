import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Gift, ArrowUpCircle, TrendingUp, Target, CheckCircle2, Medal } from 'lucide-react';
import confetti from 'canvas-confetti';

export type AchievementType = 
  | 'first_transfer'
  | 'daret_created'
  | 'daret_joined'
  | 'saving_goal'
  | 'budget_created'
  | 'streak_milestone'
  | 'top_up'
  | 'kyc_complete';

interface AchievementAnimationProps {
  type: AchievementType;
  showAnimation: boolean;
  value?: number;
  streakCount?: number;
  onAnimationComplete?: () => void;
}

export const AchievementAnimation: React.FC<AchievementAnimationProps> = ({
  type,
  showAnimation,
  value,
  streakCount,
  onAnimationComplete
}) => {
  React.useEffect(() => {
    if (showAnimation) {
      // Fire confetti when achievement is shown
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  }, [showAnimation]);

  // Get the icon and message based on achievement type
  const { icon: Icon, title, description } = React.useMemo(() => {
    switch (type) {
      case 'first_transfer':
        return {
          icon: ArrowUpCircle,
          title: 'First Transfer Complete!',
          description: 'You\'ve successfully made your first money transfer.'
        };
      case 'daret_created':
        return {
          icon: Target,
          title: 'Daret Created!',
          description: 'You\'ve successfully created a new Daret group.'
        };
      case 'daret_joined':
        return {
          icon: CheckCircle2,
          title: 'Joined a Daret!',
          description: 'You\'ve successfully joined a Daret group.'
        };
      case 'saving_goal':
        return {
          icon: Target,
          title: 'Saving Goal Reached!',
          description: `You've reached your saving goal of ${value} MAD!`
        };
      case 'budget_created':
        return {
          icon: TrendingUp,
          title: 'Budget Created!',
          description: 'You\'ve set up your first budget.'
        };
      case 'streak_milestone':
        return {
          icon: Medal,
          title: 'Streak Milestone!',
          description: `You've maintained a ${streakCount}-day streak!`
        };
      case 'top_up':
        return {
          icon: ArrowUpCircle,
          title: 'Wallet Topped Up!',
          description: `You've added ${value} MAD to your wallet.`
        };
      case 'kyc_complete':
        return {
          icon: CheckCircle2,
          title: 'KYC Verified!',
          description: 'Your identity has been verified. Enjoy full access to Floussly!'
        };
      default:
        return {
          icon: Gift,
          title: 'Achievement Unlocked!',
          description: 'You\'ve reached a new milestone.'
        };
    }
  }, [type, value, streakCount]);

  return (
    <AnimatePresence onExitComplete={onAnimationComplete}>
      {showAnimation && (
        <motion.div
          className="fixed bottom-20 inset-x-0 z-50 flex justify-center items-center pointer-events-none"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div 
            className="bg-card border border-border shadow-lg rounded-lg p-4 flex items-center max-w-sm mx-4"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ 
              type: "spring",
              damping: 15,
              stiffness: 300,
              delay: 0.2
            }}
          >
            <div className="mr-3 relative">
              <motion.div
                className="absolute inset-0 bg-primary/20 rounded-full"
                initial={{ scale: 0 }}
                animate={{ 
                  scale: [0, 1.5, 1], 
                  opacity: [0, 0.6, 0]
                }}
                transition={{ 
                  duration: 1.5,
                  repeat: Infinity,
                  repeatDelay: 2
                }}
              />
              <div className="bg-primary/10 h-12 w-12 rounded-full flex items-center justify-center relative z-10">
                <Icon className="h-6 w-6 text-primary" />
              </div>
            </div>

            <div className="flex-1">
              <motion.h4 
                className="font-bold text-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                {title}
              </motion.h4>
              <motion.p 
                className="text-xs text-muted-foreground"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                {description}
              </motion.p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AchievementAnimation;