import { useState, useEffect } from "react";
import { useTranslation } from "../lib/i18n";

export interface SavingsDataPoint {
  month: string;
  income: number;
  expenses: number;
  savings: number;
  savingsRate: number;
}

interface SavingsComparisonProps {
  timeRange?: '3m' | '6m' | '12m';
}

export function useSavingsComparison({ timeRange = '6m' }: SavingsComparisonProps = {}) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [savingsData, setSavingsData] = useState<SavingsDataPoint[]>([]);
  const { t } = useTranslation();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Simulating data fetching delay to make it feel realistic
        await new Promise(resolve => setTimeout(resolve, 200));
        
        // Build realistic savings data based on time range
        const data: SavingsDataPoint[] = [];
        
        // Define monthly data with variations based on seasonality
        const fullYearData = [
          { 
            month: t("common.months.jan"),
            income: 8500,
            expenses: 7200,
            savings: 1300,
            savingsRate: 15.3
          },
          { 
            month: t("common.months.feb"),
            income: 8700,
            expenses: 7300,
            savings: 1400,
            savingsRate: 16.1
          },
          { 
            month: t("common.months.mar"),
            income: 9300,
            expenses: 7100,
            savings: 2200,
            savingsRate: 23.7
          },
          { 
            month: t("common.months.apr"),
            income: 9000, 
            expenses: 7800,
            savings: 1200,
            savingsRate: 13.3
          },
          { 
            month: t("common.months.may"),
            income: 9500,
            expenses: 7600,
            savings: 1900,
            savingsRate: 20.0
          },
          { 
            month: t("common.months.jun"),
            income: 10200,
            expenses: 7900,
            savings: 2300, 
            savingsRate: 22.5
          },
          { 
            month: t("common.months.jul"),
            income: 9800,
            expenses: 8100,
            savings: 1700,
            savingsRate: 17.3
          },
          { 
            month: t("common.months.aug"),
            income: 9600,
            expenses: 8300,
            savings: 1300,
            savingsRate: 13.5
          },
          { 
            month: t("common.months.sep"),
            income: 9700,
            expenses: 7700,
            savings: 2000,
            savingsRate: 20.6
          },
          { 
            month: t("common.months.oct"),
            income: 10100,
            expenses: 8200,
            savings: 1900,
            savingsRate: 18.8
          },
          { 
            month: t("common.months.nov"),
            income: 10200,
            expenses: 7900,
            savings: 2300,
            savingsRate: 22.5
          },
          { 
            month: t("common.months.dec"),
            income: 10800,
            expenses: 9200,
            savings: 1600,
            savingsRate: 14.8
          }
        ];

        // Filter data based on selected time range
        switch (timeRange) {
          case '3m':
            setSavingsData(fullYearData.slice(-3));
            break;
          case '6m':
            setSavingsData(fullYearData.slice(-6));
            break;
          case '12m':
            setSavingsData(fullYearData);
            break;
        }

        setIsLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err : new Error("An unknown error occurred"));
        setIsLoading(false);
      }
    };

    fetchData();
  }, [timeRange, t]);

  return {
    savingsData,
    isLoading,
    error,
  };
}