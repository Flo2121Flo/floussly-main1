import { useState, useCallback } from 'react';
import { AchievementType } from '@/components/animations/FinancialAchievements';

interface UseAchievementResult {
  showAchievement: (type: AchievementType, data?: AchievementData) => void;
  achievementState: {
    visible: boolean;
    type: AchievementType | null;
    data: AchievementData | null;
  };
  hideAchievement: () => void;
}

export interface AchievementData {
  value?: number;
  streakCount?: number;
  customMessage?: string;
}

export function useAchievement(): UseAchievementResult {
  const [achievementState, setAchievementState] = useState<{
    visible: boolean;
    type: AchievementType | null;
    data: AchievementData | null;
  }>({
    visible: false,
    type: null,
    data: null
  });

  const showAchievement = useCallback((type: AchievementType, data?: AchievementData) => {
    setAchievementState({
      visible: true,
      type,
      data: data || null
    });
    
    // Auto-hide after a certain period
    setTimeout(() => {
      hideAchievement();
    }, 5000);
  }, []);

  const hideAchievement = useCallback(() => {
    setAchievementState(prev => ({ ...prev, visible: false }));
  }, []);

  return {
    showAchievement,
    achievementState,
    hideAchievement
  };
}

export default useAchievement;