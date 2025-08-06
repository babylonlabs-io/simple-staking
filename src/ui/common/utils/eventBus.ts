/**
 * Simple EventBus for cross-component communication without prop drilling.
 * Useful for tx progress events, activity refresh signals, etc.
 */

type EventCallback<T = any> = (data: T) => void;

class EventBus {
  private listeners: Map<string, Set<EventCallback>> = new Map();

  /**
   * Subscribe to an event
   */
  on<T = any>(event: string, callback: EventCallback<T>): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }

    this.listeners.get(event)!.add(callback);

    // Return unsubscribe function
    return () => {
      this.listeners.get(event)?.delete(callback);
      if (this.listeners.get(event)?.size === 0) {
        this.listeners.delete(event);
      }
    };
  }

  /**
   * Emit an event to all subscribers
   */
  emit<T = any>(event: string, data?: T): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach((callback) => {
        try {
          callback(data);
        } catch (error) {
          console.error(
            `EventBus: Error in listener for event "${event}":`,
            error,
          );
        }
      });
    }
  }

  /**
   * Remove all listeners for an event
   */
  off(event: string): void {
    this.listeners.delete(event);
  }

  /**
   * Remove all listeners
   */
  clear(): void {
    this.listeners.clear();
  }
}

// Singleton instance
export const eventBus = new EventBus();

// Event types for type safety
export const EVENTS = {
  // Transaction lifecycle
  TX_START: "tx:start",
  TX_SUCCESS: "tx:success",
  TX_FAIL: "tx:fail",

  // Data refresh
  ACTIVITY_REFRESH: "activity:refresh",
  DELEGATIONS_REFRESH: "delegations:refresh",
  REWARDS_REFRESH: "rewards:refresh",
  BALANCE_REFRESH: "balance:refresh",
} as const;

export type EventType = (typeof EVENTS)[keyof typeof EVENTS];

// Event payload types
export interface TxStartEvent {
  type: "stake" | "unstake" | "claim";
  txHash?: string;
}

export interface TxSuccessEvent {
  type: "stake" | "unstake" | "claim";
  txHash: string;
}

export interface TxFailEvent {
  type: "stake" | "unstake" | "claim";
  error: Error;
}
