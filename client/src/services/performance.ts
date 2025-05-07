import { useState, useCallback, useEffect } from 'react';

interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: Date;
  metadata?: Record<string, any>;
}

interface PerformanceState {
  metrics: PerformanceMetric[];
  error: string | null;
}

export const usePerformance = () => {
  const [state, setState] = useState<PerformanceState>({
    metrics: [],
    error: null,
  });

  const measurePageLoad = useCallback(() => {
    if (!window.performance) return;

    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    if (!navigation) return;

    const metrics: PerformanceMetric[] = [
      {
        name: 'page_load',
        value: navigation.loadEventEnd - navigation.startTime,
        timestamp: new Date(),
        metadata: {
          type: 'navigation',
        },
      },
      {
        name: 'dom_content_loaded',
        value: navigation.domContentLoadedEventEnd - navigation.startTime,
        timestamp: new Date(),
        metadata: {
          type: 'navigation',
        },
      },
      {
        name: 'first_byte',
        value: navigation.responseStart - navigation.requestStart,
        timestamp: new Date(),
        metadata: {
          type: 'navigation',
        },
      },
    ];

    setState((prev) => ({
      ...prev,
      metrics: [...prev.metrics, ...metrics],
    }));

    return metrics;
  }, []);

  const measureResourceTiming = useCallback(() => {
    if (!window.performance) return;

    const resources = performance.getEntriesByType('resource');
    const metrics: PerformanceMetric[] = resources.map((resource) => ({
      name: 'resource_load',
      value: resource.duration,
      timestamp: new Date(),
      metadata: {
        type: 'resource',
        name: resource.name,
        initiatorType: resource.initiatorType,
      },
    }));

    setState((prev) => ({
      ...prev,
      metrics: [...prev.metrics, ...metrics],
    }));

    return metrics;
  }, []);

  const measureUserTiming = useCallback((name: string, startMark: string, endMark: string) => {
    if (!window.performance) return;

    const start = performance.getEntriesByName(startMark)[0];
    const end = performance.getEntriesByName(endMark)[0];

    if (!start || !end) return;

    const metric: PerformanceMetric = {
      name,
      value: end.startTime - start.startTime,
      timestamp: new Date(),
      metadata: {
        type: 'user_timing',
        startMark,
        endMark,
      },
    };

    setState((prev) => ({
      ...prev,
      metrics: [...prev.metrics, metric],
    }));

    return metric;
  }, []);

  const measureMemoryUsage = useCallback(() => {
    if (!window.performance || !(performance as any).memory) return;

    const memory = (performance as any).memory;
    const metrics: PerformanceMetric[] = [
      {
        name: 'memory_usage',
        value: memory.usedJSHeapSize,
        timestamp: new Date(),
        metadata: {
          type: 'memory',
          total: memory.totalJSHeapSize,
          limit: memory.jsHeapSizeLimit,
        },
      },
    ];

    setState((prev) => ({
      ...prev,
      metrics: [...prev.metrics, ...metrics],
    }));

    return metrics;
  }, []);

  const measureNetworkInfo = useCallback(async () => {
    if (!navigator.connection) return;

    const connection = navigator.connection;
    const metrics: PerformanceMetric[] = [
      {
        name: 'network_type',
        value: 0, // Placeholder value
        timestamp: new Date(),
        metadata: {
          type: 'network',
          effectiveType: connection.effectiveType,
          downlink: connection.downlink,
          rtt: connection.rtt,
          saveData: connection.saveData,
        },
      },
    ];

    setState((prev) => ({
      ...prev,
      metrics: [...prev.metrics, ...metrics],
    }));

    return metrics;
  }, []);

  const measureFPS = useCallback(() => {
    let frameCount = 0;
    let lastTime = performance.now();
    let animationFrameId: number;

    const measure = () => {
      frameCount++;
      const currentTime = performance.now();
      const elapsed = currentTime - lastTime;

      if (elapsed >= 1000) {
        const fps = Math.round((frameCount * 1000) / elapsed);
        const metric: PerformanceMetric = {
          name: 'fps',
          value: fps,
          timestamp: new Date(),
          metadata: {
            type: 'rendering',
          },
        };

        setState((prev) => ({
          ...prev,
          metrics: [...prev.metrics, metric],
        }));

        frameCount = 0;
        lastTime = currentTime;
      }

      animationFrameId = requestAnimationFrame(measure);
    };

    animationFrameId = requestAnimationFrame(measure);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  const measureLongTasks = useCallback(() => {
    if (!window.PerformanceObserver) return;

    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const metrics: PerformanceMetric[] = entries.map((entry) => ({
        name: 'long_task',
        value: entry.duration,
        timestamp: new Date(),
        metadata: {
          type: 'long_task',
          startTime: entry.startTime,
        },
      }));

      setState((prev) => ({
        ...prev,
        metrics: [...prev.metrics, ...metrics],
      }));
    });

    observer.observe({ entryTypes: ['longtask'] });

    return () => {
      observer.disconnect();
    };
  }, []);

  const reportMetrics = useCallback(async () => {
    try {
      const response = await fetch('/api/performance/metrics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(state.metrics),
      });

      if (!response.ok) {
        throw new Error('Failed to report metrics');
      }

      // Clear reported metrics
      setState((prev) => ({
        ...prev,
        metrics: [],
      }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to report metrics',
      }));
    }
  }, [state.metrics]);

  useEffect(() => {
    // Start performance monitoring
    measurePageLoad();
    measureResourceTiming();
    measureMemoryUsage();
    measureNetworkInfo();
    const stopFPS = measureFPS();
    const stopLongTasks = measureLongTasks();

    // Report metrics periodically
    const intervalId = setInterval(reportMetrics, 60000); // Report every minute

    return () => {
      stopFPS();
      stopLongTasks();
      clearInterval(intervalId);
    };
  }, [
    measurePageLoad,
    measureResourceTiming,
    measureMemoryUsage,
    measureNetworkInfo,
    measureFPS,
    measureLongTasks,
    reportMetrics,
  ]);

  return {
    ...state,
    measurePageLoad,
    measureResourceTiming,
    measureUserTiming,
    measureMemoryUsage,
    measureNetworkInfo,
    measureFPS,
    measureLongTasks,
    reportMetrics,
  };
}; 