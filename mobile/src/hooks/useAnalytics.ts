import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';
import { useAuth } from './useAuth';

type TimeRange = 'week' | 'month' | 'year';

interface SavingsDataPoint {
  date: string;
  amount: number;
}

interface AgentDataPoint {
  date: string;
  actions: number;
}

interface AnalyticsData {
  savingsData: SavingsDataPoint[];
  agentData: AgentDataPoint[];
}

export const useAnalytics = (timeRange: TimeRange) => {
  const { token } = useAuth();
  const [cachedData, setCachedData] = useState<Record<TimeRange, AnalyticsData | null>>({
    week: null,
    month: null,
    year: null
  });

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['analytics', timeRange],
    queryFn: async () => {
      // Check cache first
      if (cachedData[timeRange]) {
        return cachedData[timeRange];
      }

      // Fetch from API
      const response = await api.get(`/analytics?timeRange=${timeRange}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const newData = response.data;
      
      // Update cache
      setCachedData(prev => ({
        ...prev,
        [timeRange]: newData
      }));

      return newData;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 30 * 60 * 1000, // 30 minutes
    enabled: !!token
  });

  // Prefetch next time range
  useEffect(() => {
    const timeRanges: TimeRange[] = ['week', 'month', 'year'];
    const currentIndex = timeRanges.indexOf(timeRange);
    const nextTimeRange = timeRanges[(currentIndex + 1) % timeRanges.length];

    if (!cachedData[nextTimeRange]) {
      api.get(`/analytics?timeRange=${nextTimeRange}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }).then(response => {
        setCachedData(prev => ({
          ...prev,
          [nextTimeRange]: response.data
        }));
      });
    }
  }, [timeRange, token]);

  return {
    savingsData: data?.savingsData || [],
    agentData: data?.agentData || [],
    isLoading,
    error,
    refetch
  };
}; 