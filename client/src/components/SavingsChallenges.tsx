import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Check, Trophy, TrendingUp, Star, Gift, Sparkles } from 'lucide-react';
import { useTranslation } from '../lib/i18n';
import confetti from 'canvas-confetti';

// Types for our challenges
interface SavingsChallenge {
  id: string;
  title: string;
  description: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  icon: keyof typeof iconMap;
  level: 'easy' | 'medium' | 'hard';
  reward: string;
  completed: boolean;
}

// Map challenge icons to components
const iconMap = {
  trophy: Trophy,
  trending: TrendingUp,
  star: Star,
  gift: Gift,
  sparkles: Sparkles,
};

export default function SavingsChallenges() {
  const { t } = useTranslation();
  const [challenges, setChallenges] = useState<SavingsChallenge[]>([]);
  const [rewardAnimation, setRewardAnimation] = useState<string | null>(null);
  const [showCompletionAnimation, setShowCompletionAnimation] = useState(false);
  
  // Mock data for challenges
  useEffect(() => {
    // In a real app, these would come from an API
    setChallenges([
      {
        id: 'save-50',
        title: t('finance.challenges.quickSaver'),
        description: t('finance.challenges.quickSaverDesc', { amount: 50 }),
        targetAmount: 50,
        currentAmount: 30,
        deadline: t('finance.challenges.hours', { count: 24 }),
        icon: 'trending',
        level: 'easy',
        reward: t('finance.challenges.points', { count: 5 }),
        completed: false
      },
      {
        id: 'save-500',
        title: t('finance.challenges.weeklyGuardian'),
        description: t('finance.challenges.weeklyGuardianDesc', { amount: 500 }),
        targetAmount: 500,
        currentAmount: 300,
        deadline: t('finance.challenges.daysLeft', { count: 3 }),
        icon: 'star',
        level: 'medium',
        reward: t('finance.challenges.points', { count: 15 }),
        completed: false
      },
      {
        id: 'save-2000',
        title: t('finance.challenges.monthlyMaster'),
        description: t('finance.challenges.monthlyMasterDesc', { amount: 2000 }),
        targetAmount: 2000,
        currentAmount: 1200,
        deadline: t('finance.challenges.daysLeft', { count: 12 }),
        icon: 'trophy',
        level: 'hard',
        reward: t('finance.challenges.bigReward', { count: 50, interest: 1.5 }),
        completed: false
      }
    ]);
  }, []);
  
  // Function to handle adding funds to a challenge
  const addFunds = (id: string, amount: number) => {
    setChallenges(prev => 
      prev.map(challenge => {
        if (challenge.id === id) {
          // Calculate new amount
          const newAmount = challenge.currentAmount + amount;
          
          // Check if challenge is completed with this contribution
          const completed = newAmount >= challenge.targetAmount;
          
          // If just completed, trigger the confetti animation
          if (!challenge.completed && completed) {
            triggerCompletionAnimation(challenge.reward);
          }
          
          return {
            ...challenge,
            currentAmount: newAmount,
            completed
          };
        }
        return challenge;
      })
    );
  };
  
  // Function to trigger reward animation when challenge is completed
  const triggerCompletionAnimation = (reward: string) => {
    // Trigger confetti
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
    
    // Show reward animation
    setRewardAnimation(reward);
    setShowCompletionAnimation(true);
    
    // Hide animation after a few seconds
    setTimeout(() => {
      setShowCompletionAnimation(false);
    }, 5000);
  };
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">{t("finance.savingChallenges")}</h2>
        <Button variant="outline" size="sm">
          {t("common.viewAll")}
        </Button>
      </div>
      
      {/* Challenges list */}
      {challenges.map(challenge => {
        const Icon = iconMap[challenge.icon];
        const progress = Math.floor((challenge.currentAmount / challenge.targetAmount) * 100);
        
        return (
          <Card key={challenge.id} className={`${challenge.completed ? 'border-green-500 bg-green-50 dark:bg-green-950/20' : ''}`}>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className={`p-2 rounded-full 
                    ${challenge.level === 'easy' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300' : 
                      challenge.level === 'medium' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300' : 
                        'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300'}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <CardTitle className="text-lg">{challenge.title}</CardTitle>
                </div>
                {challenge.completed && (
                  <div className="flex items-center text-green-600 dark:text-green-400">
                    <Check className="h-5 w-5 mr-1" />
                    <span className="text-sm font-medium">{t("common.completed")}</span>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-2">{challenge.description}</p>
              <div className="flex justify-between text-sm mb-1">
                <span>{t("finance.progress")}</span>
                <span className="font-medium">{challenge.currentAmount} / {challenge.targetAmount} {t("common.currency")}</span>
              </div>
              <Progress value={progress} className="h-2 mb-3" />
              <div className="flex justify-between items-center text-xs text-muted-foreground">
                <span>{t("finance.deadline")}: {challenge.deadline}</span>
                <span>{t("finance.reward")}: {challenge.reward}</span>
              </div>
              
              {!challenge.completed && (
                <div className="mt-3 flex gap-2 justify-end">
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => addFunds(challenge.id, 10)}
                  >
                    +10 {t("common.currency")}
                  </Button>
                  <Button 
                    size="sm"
                    onClick={() => addFunds(challenge.id, 50)}
                  >
                    +50 {t("common.currency")}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
      
      {/* Reward animation */}
      <AnimatePresence>
        {showCompletionAnimation && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            className="fixed inset-0 flex items-center justify-center z-50 bg-black/50"
            onClick={() => setShowCompletionAnimation(false)}
          >
            <motion.div 
              className="bg-background rounded-lg p-8 text-center max-w-sm mx-4"
              initial={{ y: 50 }}
              animate={{ y: 0 }}
            >
              <motion.div 
                animate={{ 
                  rotate: [0, 10, -10, 10, 0],
                  scale: [1, 1.2, 1]
                }}
                transition={{ duration: 1, repeat: Infinity, repeatType: "reverse" }}
                className="mx-auto mb-4 bg-primary/10 rounded-full p-4 w-20 h-20 flex items-center justify-center"
              >
                <Trophy className="h-10 w-10 text-primary" />
              </motion.div>
              <h3 className="text-xl font-bold mb-2">{t("finance.challengeCompleted")} 🎉</h3>
              <p className="mb-4">{t("finance.congratulations")}</p>
              <div className="bg-primary/10 rounded-lg py-2 px-4 mb-4 inline-block font-semibold text-primary">
                {rewardAnimation}
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                {t("finance.keepUpGreatWork")}
              </p>
              <Button onClick={() => setShowCompletionAnimation(false)}>
                {t("finance.claimReward")}
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}