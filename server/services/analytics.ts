import Mixpanel from 'mixpanel';
import { config } from '../config';
import logger from './logging';

const mixpanel = Mixpanel.init(config.mixpanel.token, {
  debug: config.environment !== 'production',
});

// Event names
export const Events = {
  // User events
  USER_SIGNUP: 'User Signup',
  USER_LOGIN: 'User Login',
  USER_LOGOUT: 'User Logout',
  USER_UPDATE_PROFILE: 'User Update Profile',
  USER_VERIFY_KYC: 'User Verify KYC',
  
  // Transaction events
  TRANSACTION_STARTED: 'Transaction Started',
  TRANSACTION_COMPLETED: 'Transaction Completed',
  TRANSACTION_FAILED: 'Transaction Failed',
  TRANSACTION_CANCELLED: 'Transaction Cancelled',
  
  // Payment events
  PAYMENT_INITIATED: 'Payment Initiated',
  PAYMENT_COMPLETED: 'Payment Completed',
  PAYMENT_FAILED: 'Payment Failed',
  
  // Feature usage
  FEATURE_ACCESSED: 'Feature Accessed',
  FEATURE_COMPLETED: 'Feature Completed',
  FEATURE_ABANDONED: 'Feature Abandoned',
  
  // Error events
  ERROR_OCCURRED: 'Error Occurred',
  VALIDATION_ERROR: 'Validation Error',
  
  // Performance events
  API_LATENCY: 'API Latency',
  PAGE_LOAD_TIME: 'Page Load Time',
} as const;

// Analytics service class
export class AnalyticsService {
  private static instance: AnalyticsService;
  
  private constructor() {}
  
  public static getInstance(): AnalyticsService {
    if (!AnalyticsService.instance) {
      AnalyticsService.instance = new AnalyticsService();
    }
    return AnalyticsService.instance;
  }
  
  // Track user event
  public trackUserEvent(
    userId: string,
    eventName: keyof typeof Events,
    properties?: Record<string, any>
  ): void {
    try {
      mixpanel.track(eventName, {
        distinct_id: userId,
        ...properties,
        environment: config.environment,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error('Failed to track user event', {
        error,
        eventName,
        userId,
      });
    }
  }
  
  // Track anonymous event
  public trackAnonymousEvent(
    eventName: keyof typeof Events,
    properties?: Record<string, any>
  ): void {
    try {
      mixpanel.track(eventName, {
        ...properties,
        environment: config.environment,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error('Failed to track anonymous event', {
        error,
        eventName,
      });
    }
  }
  
  // Identify user
  public identifyUser(
    userId: string,
    traits: Record<string, any>
  ): void {
    try {
      mixpanel.people.set(userId, {
        ...traits,
        $last_seen: new Date().toISOString(),
      });
    } catch (error) {
      logger.error('Failed to identify user', {
        error,
        userId,
      });
    }
  }
  
  // Track user journey
  public trackUserJourney(
    userId: string,
    step: string,
    properties?: Record<string, any>
  ): void {
    try {
      mixpanel.track('User Journey', {
        distinct_id: userId,
        step,
        ...properties,
        environment: config.environment,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error('Failed to track user journey', {
        error,
        userId,
        step,
      });
    }
  }
  
  // Track conversion funnel
  public trackFunnel(
    userId: string,
    funnelName: string,
    step: number,
    properties?: Record<string, any>
  ): void {
    try {
      mixpanel.track('Funnel Step', {
        distinct_id: userId,
        funnel_name: funnelName,
        step,
        ...properties,
        environment: config.environment,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error('Failed to track funnel', {
        error,
        userId,
        funnelName,
        step,
      });
    }
  }
  
  // Track error
  public trackError(
    error: Error,
    context: Record<string, any>
  ): void {
    try {
      mixpanel.track(Events.ERROR_OCCURRED, {
        error_name: error.name,
        error_message: error.message,
        error_stack: error.stack,
        ...context,
        environment: config.environment,
        timestamp: new Date().toISOString(),
      });
    } catch (trackingError) {
      logger.error('Failed to track error', {
        error: trackingError,
        originalError: error,
        context,
      });
    }
  }
  
  // Track performance metric
  public trackPerformance(
    metricName: string,
    value: number,
    properties?: Record<string, any>
  ): void {
    try {
      mixpanel.track('Performance Metric', {
        metric_name: metricName,
        value,
        ...properties,
        environment: config.environment,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error('Failed to track performance', {
        error,
        metricName,
        value,
      });
    }
  }
}

// Export singleton instance
export const analytics = AnalyticsService.getInstance(); 