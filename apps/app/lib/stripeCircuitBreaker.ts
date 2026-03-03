/**
 * Circuit Breaker Pattern for Stripe API Calls
 * Prevents cascading failures in production
 */

export interface CircuitBreakerState {
  state: 'CLOSED' | 'OPEN' | 'HALF_OPEN';
  failureCount: number;
  lastFailureTime: number;
  successCount: number;
}

class StripeCircuitBreaker {
  private state: CircuitBreakerState = {
    state: 'CLOSED',
    failureCount: 0,
    lastFailureTime: 0,
    successCount: 0,
  };

  private readonly failureThreshold = 3;
  private readonly timeout = 60000; // 1 minute
  private readonly successThreshold = 2;

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.state.state === 'OPEN') {
      if (Date.now() - this.state.lastFailureTime > this.timeout) {
        this.state.state = 'HALF_OPEN';
        this.state.successCount = 0;
        console.log('[Circuit Breaker] 🔄 Moving to HALF_OPEN state');
      } else {
        throw new Error('Circuit breaker is OPEN - Stripe service unavailable');
      }
    }

    try {
      const result = await operation();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess(): void {
    this.state.failureCount = 0;
    
    if (this.state.state === 'HALF_OPEN') {
      this.state.successCount++;
      if (this.state.successCount >= this.successThreshold) {
        this.state.state = 'CLOSED';
        console.log('[Circuit Breaker] ✅ Moving to CLOSED state - service recovered');
      }
    }
  }

  private onFailure(): void {
    this.state.failureCount++;
    this.state.lastFailureTime = Date.now();

    if (this.state.failureCount >= this.failureThreshold) {
      this.state.state = 'OPEN';
      console.log('[Circuit Breaker] ⚠️ Moving to OPEN state - too many failures');
    }
  }

  getState(): CircuitBreakerState {
    return { ...this.state };
  }

  reset(): void {
    this.state = {
      state: 'CLOSED',
      failureCount: 0,
      lastFailureTime: 0,
      successCount: 0,
    };
    console.log('[Circuit Breaker] 🔄 Circuit breaker reset');
  }
}

export const stripeCircuitBreaker = new StripeCircuitBreaker();
