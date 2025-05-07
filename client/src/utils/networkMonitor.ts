import { securityConfig } from '@/config/security';

interface NetworkRequest {
  url: string;
  method: string;
  startTime: number;
  endTime?: number;
  status?: number;
  error?: string;
  responseSize?: number;
}

interface NetworkReport {
  timestamp: number;
  requests: NetworkRequest[];
  connection: {
    effectiveType: string;
    downlink: number;
    rtt: number;
  };
}

class NetworkMonitor {
  private static instance: NetworkMonitor;
  private requests: NetworkRequest[] = [];
  private reports: NetworkReport[] = [];
  private readonly maxRequests = 1000;

  private constructor() {
    this.initializeNetworkMonitoring();
  }

  public static getInstance(): NetworkMonitor {
    if (!NetworkMonitor.instance) {
      NetworkMonitor.instance = new NetworkMonitor();
    }
    return NetworkMonitor.instance;
  }

  private initializeNetworkMonitoring(): void {
    if (!securityConfig.monitoring.enabled) return;

    // Intercept fetch requests
    const originalFetch = window.fetch;
    window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
      const request: NetworkRequest = {
        url: typeof input === 'string' ? input : input.url,
        method: init?.method || 'GET',
        startTime: Date.now(),
      };

      this.requests.push(request);

      try {
        const response = await originalFetch(input, init);
        request.endTime = Date.now();
        request.status = response.status;

        // Clone response to get size
        const clone = response.clone();
        const blob = await clone.blob();
        request.responseSize = blob.size;

        return response;
      } catch (error) {
        request.endTime = Date.now();
        request.error = error instanceof Error ? error.message : 'Unknown error';
        throw error;
      }
    };

    // Monitor connection changes
    if ('connection' in navigator) {
      (navigator as any).connection.addEventListener('change', () => {
        this.collectMetrics();
      });
    }
  }

  private async collectMetrics(): Promise<NetworkReport> {
    const report: NetworkReport = {
      timestamp: Date.now(),
      requests: this.requests.slice(-this.maxRequests),
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
    if (!securityConfig.monitoring.enabled) return;

    try {
      const report = await this.collectMetrics();
      const shouldSend = Math.random() < securityConfig.performance.sampleRate;

      if (shouldSend) {
        await fetch(`${securityConfig.api.baseUrl}/network`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(report),
        });
      }
    } catch (error) {
      console.error('Failed to send network report:', error);
    }
  }

  public getRequests(): NetworkRequest[] {
    return this.requests;
  }

  public getReports(): NetworkReport[] {
    return this.reports;
  }

  public clearRequests(): void {
    this.requests = [];
  }

  public clearReports(): void {
    this.reports = [];
  }

  public getAverageResponseTime(): number {
    const completedRequests = this.requests.filter(r => r.endTime);
    if (completedRequests.length === 0) return 0;

    const totalTime = completedRequests.reduce((sum, req) => {
      return sum + ((req.endTime || 0) - req.startTime);
    }, 0);

    return totalTime / completedRequests.length;
  }

  public getSuccessRate(): number {
    const completedRequests = this.requests.filter(r => r.endTime);
    if (completedRequests.length === 0) return 0;

    const successfulRequests = completedRequests.filter(r => r.status && r.status >= 200 && r.status < 300);
    return (successfulRequests.length / completedRequests.length) * 100;
  }

  public getAverageResponseSize(): number {
    const completedRequests = this.requests.filter(r => r.responseSize);
    if (completedRequests.length === 0) return 0;

    const totalSize = completedRequests.reduce((sum, req) => {
      return sum + (req.responseSize || 0);
    }, 0);

    return totalSize / completedRequests.length;
  }
}

export const networkMonitor = NetworkMonitor.getInstance();

// Initialize network monitoring
if (securityConfig.monitoring.enabled) {
  // Send periodic reports
  setInterval(() => {
    networkMonitor.sendReport();
  }, 60000); // Every minute
}

export default networkMonitor; 