import React, { createContext, useContext, ReactNode } from 'react';
import useAchievement, { AchievementData } from '@/hooks/use-achievement';
import { AchievementType, AchievementAnimation } from '@/components/animations/FinancialAchievements';
import ProgressCelebration from '@/components/animations/ProgressCelebration';

interface AchievementContextType {
  showAchievement: (type: AchievementType, data?: AchievementData) => void;
  showCelebration: (type: 'savings' | 'payment' | 'budget' | 'transfer' | 'daret', data?: {
    amount?: number;
    target?: number;
    message?: string;
  }) => void;
}

const AchievementContext = createContext<AchievementContextType | undefined>(undefined);

export const AchievementProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { showAchievement, achievementState, hideAchievement } = useAchievement();
  const [celebrationType, setCelebrationType] = React.useState<null | {
    type: 'savings' | 'payment' | 'budget' | 'transfer' | 'daret';
    amount?: number;
    target?: number;
    message?: string;
  }>(null);

  const showCelebration = (
    type: 'savings' | 'payment' | 'budget' | 'transfer' | 'daret', 
    data?: {
      amount?: number;
      target?: number;
      message?: string;
    }
  ) => {
    setCelebrationType({ 
      type, 
      amount: data?.amount, 
      target: data?.target,
      message: data?.message
    });
  };

  const handleCelebrationComplete = () => {
    setCelebrationType(null);
  };

  return (
    <AchievementContext.Provider value={{ showAchievement, showCelebration }}>
      {children}
      
      {/* Render the achievement animation */}
      {achievementState.visible && achievementState.type && (
        <AchievementAnimation
          type={achievementState.type}
          showAnimation={achievementState.visible}
          value={achievementState.data?.value}
          streakCount={achievementState.data?.streakCount}
          onAnimationComplete={hideAchievement}
        />
      )}
      
      {/* Render the celebration animation */}
      {celebrationType && (
        <ProgressCelebration
          type={celebrationType.type}
          amount={celebrationType.amount}
          target={celebrationType.target}
          message={celebrationType.message}
          onComplete={handleCelebrationComplete}
        />
      )}
    </AchievementContext.Provider>
  );
};

export const useAchievementContext = (): AchievementContextType => {
  const context = useContext(AchievementContext);
  if (context === undefined) {
    throw new Error('useAchievementContext must be used within an AchievementProvider');
  }
  return context;
};

export default AchievementContext;