import { useState, useEffect } from 'react';

// Types
interface DailyData {
  name: string;
  value: number;
}

interface MonthlyData {
  name: string;
  amount: number | null;
  projected: number | null;
}

interface BalanceTrends {
  dailyTrend: DailyData[];
  monthlyTrend: MonthlyData[];
  isLoading: boolean;
  error: Error | null;
}

/**
 * Hook for providing consistent balance trend data across the application
 */
export function useBalanceTrends(): BalanceTrends {
  const [dailyTrend, setDailyTrend] = useState<DailyData[]>([]);
  const [monthlyTrend, setMonthlyTrend] = useState<MonthlyData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    try {
      // In a real app, this would come from an API call
      // For now, generate consistent data for the demo
      
      // Generate daily data
      const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      // Use specific seed values for consistency
      const dailyValues = [1200, 1350, 1240, 1510, 1670, 1590, 1780];
      
      const dailyData = days.map((day, index) => ({
        name: day,
        value: dailyValues[index]
      }));
      
      // Generate monthly data
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const currentMonth = new Date().getMonth();
      
      // Use specific seed values for monthly data
      const baseValues = [1000, 1200, 1150, 1300, 1450, 1600, 1550, 1700, 1800, 1850, 1950, 2100];
      
      const monthlyData = months.map((month, index) => {
        const isCurrentMonth = index === currentMonth;
        const isPastMonth = index < currentMonth;
        
        // Only show data for past months and current month
        const value = isPastMonth || isCurrentMonth 
          ? baseValues[index]
          : null;
          
        return {
          name: month,
          amount: value,
          // Add a slight upward trend for projections
          projected: isPastMonth ? null : isCurrentMonth 
            ? value 
            : index > currentMonth 
              ? baseValues[index]
              : null
        };
      });
      
      setDailyTrend(dailyData);
      setMonthlyTrend(monthlyData);
      setIsLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load balance trends'));
      setIsLoading(false);
    }
  }, []);

  return {
    dailyTrend,
    monthlyTrend,
    isLoading,
    error
  };
}