import { useState, useCallback } from 'react';

interface AnalyticsEvent {
  category: string;
  action: string;
  label?: string;
  value?: number;
  timestamp: Date;
  metadata?: Record<string, any>;
}

interface AnalyticsState {
  events: AnalyticsEvent[];
  error: string | null;
}

export const useAnalytics = () => {
  const [state, setState] = useState<AnalyticsState>({
    events: [],
    error: null,
  });

  const trackEvent = useCallback(async (event: Omit<AnalyticsEvent, 'timestamp'>) => {
    try {
      const analyticsEvent: AnalyticsEvent = {
        ...event,
        timestamp: new Date(),
      };

      // Store event locally
      setState((prev) => ({
        ...prev,
        events: [...prev.events, analyticsEvent],
      }));

      // Send event to analytics server
      await fetch('/api/analytics/track', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(analyticsEvent),
      });
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to track event',
      }));
    }
  }, []);

  const trackPageView = useCallback(async (page: string) => {
    await trackEvent({
      category: 'Page',
      action: 'View',
      label: page,
    });
  }, [trackEvent]);

  const trackFeatureUsage = useCallback(async (feature: string, action: string) => {
    await trackEvent({
      category: 'Feature',
      action,
      label: feature,
    });
  }, [trackEvent]);

  const trackError = useCallback(async (error: Error, context: string) => {
    await trackEvent({
      category: 'Error',
      action: 'Occurred',
      label: error.message,
      metadata: {
        context,
        stack: error.stack,
      },
    });
  }, [trackEvent]);

  const trackPerformance = useCallback(async (metric: string, value: number) => {
    await trackEvent({
      category: 'Performance',
      action: 'Measure',
      label: metric,
      value,
    });
  }, [trackEvent]);

  const trackUserAction = useCallback(async (action: string, details?: Record<string, any>) => {
    await trackEvent({
      category: 'User',
      action,
      metadata: details,
    });
  }, [trackEvent]);

  const trackTreasureInteraction = useCallback(async (
    action: 'create' | 'unlock' | 'claim',
    treasureId: string,
    success: boolean
  ) => {
    await trackEvent({
      category: 'Treasure',
      action,
      label: treasureId,
      metadata: {
        success,
      },
    });
  }, [trackEvent]);

  const trackMessageInteraction = useCallback(async (
    action: 'send' | 'receive' | 'read',
    messageType: 'text' | 'voice' | 'treasure',
    success: boolean
  ) => {
    await trackEvent({
      category: 'Message',
      action,
      label: messageType,
      metadata: {
        success,
      },
    });
  }, [trackEvent]);

  const trackPayment = useCallback(async (
    action: 'initiate' | 'complete' | 'fail',
    amount: number,
    currency: string,
    provider: string
  ) => {
    await trackEvent({
      category: 'Payment',
      action,
      value: amount,
      metadata: {
        currency,
        provider,
      },
    });
  }, [trackEvent]);

  const getAnalytics = useCallback(async (startDate: Date, endDate: Date) => {
    try {
      const response = await fetch(
        `/api/analytics?start=${startDate.toISOString()}&end=${endDate.toISOString()}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch analytics');
      }

      return response.json();
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to fetch analytics',
      }));
      throw error;
    }
  }, []);

  const getFeatureUsage = useCallback(async (feature: string) => {
    try {
      const response = await fetch(`/api/analytics/features/${feature}`);

      if (!response.ok) {
        throw new Error('Failed to fetch feature usage');
      }

      return response.json();
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to fetch feature usage',
      }));
      throw error;
    }
  }, []);

  const getErrorStats = useCallback(async () => {
    try {
      const response = await fetch('/api/analytics/errors');

      if (!response.ok) {
        throw new Error('Failed to fetch error statistics');
      }

      return response.json();
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to fetch error statistics',
      }));
      throw error;
    }
  }, []);

  return {
    ...state,
    trackEvent,
    trackPageView,
    trackFeatureUsage,
    trackError,
    trackPerformance,
    trackUserAction,
    trackTreasureInteraction,
    trackMessageInteraction,
    trackPayment,
    getAnalytics,
    getFeatureUsage,
    getErrorStats,
  };
}; 