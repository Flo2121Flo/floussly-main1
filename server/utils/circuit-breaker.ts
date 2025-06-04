import { EventEmitter } from 'events';
import { logger } from './logger';
import { CircuitBreakerError } from './enhanced-error';

interface CircuitBreakerOptions {
  failureThreshold: number;      // Number of failures before opening the circuit
  resetTimeout: number;          // Time in ms to wait before attempting to close the circuit
  monitorInterval: number;       // Time in ms between monitoring checks
  name: string;                  // Name of the circuit breaker (for logging)
}

interface CircuitBreakerState {
  failures: number;
  lastFailureTime: number;
  isOpen: boolean;
  lastStateChange: number;
}

export class CircuitBreaker extends EventEmitter {
  private state: CircuitBreakerState;
  private options: CircuitBreakerOptions;
  private monitorInterval: NodeJS.Timeout | null = null;

  constructor(options: Partial<CircuitBreakerOptions> = {}) {
    super();
    this.options = {
      failureThreshold: options.failureThreshold || 5,
      resetTimeout: options.resetTimeout || 30000,
      monitorInterval: options.monitorInterval || 10000,
      name: options.name || 'default',
    };

    this.state = {
      failures: 0,
      lastFailureTime: 0,
      isOpen: false,
      lastStateChange: Date.now(),
    };

    this.startMonitoring();
  }

  private startMonitoring(): void {
    if (this.monitorInterval) {
      clearInterval(this.monitorInterval);
    }

    this.monitorInterval = setInterval(() => {
      this.checkCircuit();
    }, this.options.monitorInterval);
  }

  private checkCircuit(): void {
    if (this.state.isOpen) {
      const now = Date.now();
      const timeSinceLastFailure = now - this.state.lastFailureTime;

      if (timeSinceLastFailure >= this.options.resetTimeout) {
        this.closeCircuit();
        logger.info(`Circuit breaker ${this.options.name} closed after timeout`, {
          timeSinceLastFailure,
          resetTimeout: this.options.resetTimeout,
        });
      }
    }
  }

  private openCircuit(): void {
    if (!this.state.isOpen) {
      this.state.isOpen = true;
      this.state.lastStateChange = Date.now();
      this.emit('open');
      logger.warn(`Circuit breaker ${this.options.name} opened`, {
        failures: this.state.failures,
        threshold: this.options.failureThreshold,
      });
    }
  }

  private closeCircuit(): void {
    if (this.state.isOpen) {
      this.state.isOpen = false;
      this.state.failures = 0;
      this.state.lastStateChange = Date.now();
      this.emit('close');
      logger.info(`Circuit breaker ${this.options.name} closed`);
    }
  }

  private incrementFailures(): void {
    this.state.failures++;
    this.state.lastFailureTime = Date.now();

    if (this.state.failures >= this.options.failureThreshold) {
      this.openCircuit();
    }
  }

  private resetFailures(): void {
    this.state.failures = 0;
  }

  public async execute<T>(
    operation: () => Promise<T>,
    fallback?: () => Promise<T>
  ): Promise<T> {
    if (this.state.isOpen) {
      logger.warn(`Circuit breaker ${this.options.name} is open, using fallback`, {
        timeSinceLastFailure: Date.now() - this.state.lastFailureTime,
      });

      if (fallback) {
        try {
          return await fallback();
        } catch (error) {
          throw new CircuitBreakerError(this.options.name);
        }
      }

      throw new CircuitBreakerError(this.options.name);
    }

    try {
      const result = await operation();
      this.resetFailures();
      return result;
    } catch (error) {
      this.incrementFailures();
      throw error;
    }
  }

  public getState(): CircuitBreakerState {
    return { ...this.state };
  }

  public forceOpen(): void {
    this.openCircuit();
  }

  public forceClose(): void {
    this.closeCircuit();
  }

  public destroy(): void {
    if (this.monitorInterval) {
      clearInterval(this.monitorInterval);
      this.monitorInterval = null;
    }
  }
}

// Circuit breaker registry to manage multiple circuit breakers
export class CircuitBreakerRegistry {
  private static instance: CircuitBreakerRegistry;
  private breakers: Map<string, CircuitBreaker>;

  private constructor() {
    this.breakers = new Map();
  }

  public static getInstance(): CircuitBreakerRegistry {
    if (!CircuitBreakerRegistry.instance) {
      CircuitBreakerRegistry.instance = new CircuitBreakerRegistry();
    }
    return CircuitBreakerRegistry.instance;
  }

  public getBreaker(name: string, options?: Partial<CircuitBreakerOptions>): CircuitBreaker {
    if (!this.breakers.has(name)) {
      this.breakers.set(name, new CircuitBreaker({ ...options, name }));
    }
    return this.breakers.get(name)!;
  }

  public getBreakers(): Map<string, CircuitBreaker> {
    return this.breakers;
  }

  public destroyAll(): void {
    this.breakers.forEach(breaker => breaker.destroy());
    this.breakers.clear();
  }
} 