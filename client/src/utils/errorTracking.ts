import { securityConfig } from '@/config/security';

interface ErrorReport {
  timestamp: number;
  url: string;
  error: {
    name: string;
    message: string;
    stack?: string;
  };
  userAgent: string;
  breadcrumbs: {
    timestamp: number;
    category: string;
    message: string;
    level: 'info' | 'warning' | 'error';
  }[];
}

class ErrorTracker {
  private static instance: ErrorTracker;
  private breadcrumbs: ErrorReport['breadcrumbs'] = [];
  private reports: ErrorReport[] = [];
  private readonly maxBreadcrumbs = 100;

  private constructor() {
    this.initializeErrorHandlers();
  }

  public static getInstance(): ErrorTracker {
    if (!ErrorTracker.instance) {
      ErrorTracker.instance = new ErrorTracker();
    }
    return ErrorTracker.instance;
  }

  private initializeErrorHandlers(): void {
    if (!securityConfig.monitoring.enabled) return;

    // Global error handler
    window.addEventListener('error', (event) => {
      this.handleError(event.error || new Error(event.message));
    });

    // Unhandled promise rejection handler
    window.addEventListener('unhandledrejection', (event) => {
      this.handleError(event.reason);
    });

    // Console error interceptor
    const originalConsoleError = console.error;
    console.error = (...args) => {
      this.handleError(new Error(args.join(' ')));
      originalConsoleError.apply(console, args);
    };
  }

  private handleError(error: Error): void {
    const report: ErrorReport = {
      timestamp: Date.now(),
      url: window.location.href,
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack,
      },
      userAgent: navigator.userAgent,
      breadcrumbs: [...this.breadcrumbs],
    };

    this.reports.push(report);
    this.sendReport(report);
  }

  public addBreadcrumb(category: string, message: string, level: 'info' | 'warning' | 'error' = 'info'): void {
    if (!securityConfig.monitoring.enabled) return;

    this.breadcrumbs.push({
      timestamp: Date.now(),
      category,
      message,
      level,
    });

    // Keep only the last N breadcrumbs
    if (this.breadcrumbs.length > this.maxBreadcrumbs) {
      this.breadcrumbs = this.breadcrumbs.slice(-this.maxBreadcrumbs);
    }
  }

  private async sendReport(report: ErrorReport): Promise<void> {
    if (!securityConfig.monitoring.enabled) return;

    try {
      await fetch(`${securityConfig.api.baseUrl}/errors`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(report),
      });
    } catch (error) {
      console.error('Failed to send error report:', error);
    }
  }

  public getReports(): ErrorReport[] {
    return this.reports;
  }

  public clearReports(): void {
    this.reports = [];
  }

  public clearBreadcrumbs(): void {
    this.breadcrumbs = [];
  }
}

export const errorTracker = ErrorTracker.getInstance();

// Initialize error tracking
if (securityConfig.monitoring.enabled) {
  // Add initial breadcrumb
  errorTracker.addBreadcrumb('system', 'Application started', 'info');

  // Add navigation breadcrumbs
  window.addEventListener('popstate', () => {
    errorTracker.addBreadcrumb('navigation', `Navigated to ${window.location.pathname}`, 'info');
  });
}

export default errorTracker; 