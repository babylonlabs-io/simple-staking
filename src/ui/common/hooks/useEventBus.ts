import { useEffect, useRef } from "react";

import { eventBus, type EventType } from "@/ui/common/utils/eventBus";

/**
 * Hook to subscribe to EventBus events with automatic cleanup
 */
export function useEventBus<T = any>(
  event: EventType,
  callback: (data: T) => void,
) {
  const callbackRef = useRef(callback);

  // Keep callback ref current
  useEffect(() => {
    callbackRef.current = callback;
  });

  useEffect(() => {
    const unsubscribe = eventBus.on(event, (data: T) => {
      callbackRef.current(data);
    });

    return unsubscribe;
  }, [event]);
}

/**
 * Hook to emit events
 */
export function useEventEmitter() {
  return {
    emit: eventBus.emit.bind(eventBus),
  };
}
