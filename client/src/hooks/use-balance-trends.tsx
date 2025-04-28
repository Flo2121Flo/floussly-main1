import { useState, useEffect } from "react";

export interface MonthlyTrendData {
  name: string;
  amount: number;
  projected?: number;
}

interface BalanceTrendsProps {
  timeRange?: string; // '3m', '6m', '12m'
  chartType?: string; // 'income', 'expenses', 'both'
}

export function useBalanceTrends() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [monthlyTrend, setMonthlyTrend] = useState<MonthlyTrendData[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Simulating data fetching delay to make it feel realistic
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // Generate realistic financial data with trends that make sense
        // Base data for a full year
        const fullYearData = [
          { name: "Jan", amount: 5200, projected: 5200 },
          { name: "Feb", amount: 5700, projected: 5400 },
          { name: "Mar", amount: 4800, projected: 5600 },
          { name: "Apr", amount: 6300, projected: 5800 },
          { name: "May", amount: 5900, projected: 6000 },
          { name: "Jun", amount: 7200, projected: 6200 },
          { name: "Jul", amount: 6800, projected: 6400 },
          { name: "Aug", amount: 7100, projected: 6600 },
          { name: "Sep", amount: 7600, projected: 6800 },
          { name: "Oct", amount: 8300, projected: 7000 },
          { name: "Nov", amount: 8800, projected: 7200 },
          { name: "Dec", amount: 9500, projected: 7400 },
        ];
        
        setMonthlyTrend(fullYearData);
        setIsLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err : new Error("An unknown error occurred"));
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  return {
    monthlyTrend,
    isLoading,
    error,
  };
}