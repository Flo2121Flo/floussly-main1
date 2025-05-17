import { useQuery } from '@tanstack/react-query';
import { api } from '../../../services/api';
import { useAuth } from '../../../hooks/useAuth';

interface TransactionTrends {
  totalVolume: number;
  totalTransactions: number;
  averageAmount: number;
  data: Array<{
    date: string;
    volume: number;
    frequency: number;
    averageAmount: number;
  }>;
}

export const useTransactionTrends = (timeRange: 'week' | 'month' | 'year') => {
  const { user } = useAuth();

  return useQuery<TransactionTrends>({
    queryKey: ['transactionTrends', timeRange],
    queryFn: async () => {
      const { data } = await api.get(`/api/transactions/trends`, {
        params: { timeRange }
      });
      return data;
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 30 * 60 * 1000, // 30 minutes
  });
}; 