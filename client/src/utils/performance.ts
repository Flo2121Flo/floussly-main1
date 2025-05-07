import { securityConfig } from '@/config/security';

interface PerformanceMetric {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
}

interface PerformanceReport {
  timestamp: number;
  url: string;
  metrics: PerformanceMetric[];
  userAgent: string;
  connection: {
    effectiveType: string;
    downlink: number;
    rtt: number;
  };
}

class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: PerformanceMetric[] = [];
  private reports: PerformanceReport[] = [];
  private observer: PerformanceObserver | null = null;

  private constructor() {
    this.initializeObserver();
  }

  public static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  private initializeObserver(): void {
    if (!securityConfig.performance.enabled) return;

    try {
      this.observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.handlePerformanceEntry(entry);
        }
      });

      this.observer.observe({ entryTypes: ['measure', 'resource', 'paint', 'largest-contentful-paint'] });
    } catch (error) {
      console.error('Performance monitoring initialization failed:', error);
    }
  }

  private handlePerformanceEntry(entry: PerformanceEntry): void {
    const metric = this.createMetric(entry);
    if (metric) {
      this.metrics.push(metric);
    }
  }

  private createMetric(entry: PerformanceEntry): PerformanceMetric | null {
    const { name, duration } = entry;
    let rating: 'good' | 'needs-improvement' | 'poor' = 'good';

    switch (name) {
      case 'FCP':
        if (duration > 1800) rating = 'poor';
        else if (duration > 1000) rating = 'needs-improvement';
        break;
      case 'LCP':
        if (duration > 2500) rating = 'poor';
        else if (duration > 1800) rating = 'needs-improvement';
        break;
      case 'FID':
        if (duration > 100) rating = 'poor';
        else if (duration > 50) rating = 'needs-improvement';
        break;
      case 'CLS':
        if (duration > 0.25) rating = 'poor';
        else if (duration > 0.1) rating = 'needs-improvement';
        break;
      case 'TTFB':
        if (duration > 600) rating = 'poor';
        else if (duration > 400) rating = 'needs-improvement';
        break;
      default:
        return null;
    }

    return { name, value: duration, rating };
  }

  public async collectMetrics(): Promise<PerformanceReport> {
    const report: PerformanceReport = {
      timestamp: Date.now(),
      url: window.location.href,
      metrics: this.metrics,
      userAgent: navigator.userAgent,
      connection: {
        effectiveType: (navigator as any).connection?.effectiveType || 'unknown',
        downlink: (navigator as any).connection?.downlink || 0,
        rtt: (navigator as any).connection?.rtt || 0,
      },
    };

    this.reports.push(report);
    return report;
  }

  public async sendReport(): Promise<void> {
    if (!securityConfig.performance.enabled) return;

    try {
      const report = await this.collectMetrics();
      const shouldSend = Math.random() < securityConfig.performance.sampleRate;

      if (shouldSend) {
        await fetch(`${securityConfig.api.baseUrl}/metrics`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(report),
        });
      }
    } catch (error) {
      console.error('Failed to send performance report:', error);
    }
  }

  public getMetrics(): PerformanceMetric[] {
    return this.metrics;
  }

  public getReports(): PerformanceReport[] {
    return this.reports;
  }

  public clearMetrics(): void {
    this.metrics = [];
  }

  public clearReports(): void {
    this.reports = [];
  }

  public destroy(): void {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
  }
}

export const performanceMonitor = PerformanceMonitor.getInstance();

// Initialize performance monitoring
if (securityConfig.performance.enabled) {
  // Send initial report after page load
  window.addEventListener('load', () => {
    setTimeout(() => {
      performanceMonitor.sendReport();
    }, 2000);
  });

  // Send periodic reports
  setInterval(() => {
    performanceMonitor.sendReport();
  }, 60000); // Every minute
}

export default performanceMonitor; 