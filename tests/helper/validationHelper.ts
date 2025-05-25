import { renderHook } from "@testing-library/react";

export function testHookStability<T>(
  hookCallback: () => T,
  options?: {
    wrapper?: React.ComponentType<{ children: React.ReactNode }>;
    maxRenders?: number;
  },
): { renderCount: number; result: T } {
  const { wrapper, maxRenders = 10 } = options || {};
  let renderCount = 0;

  const wrappedHook = () => {
    renderCount++;
    if (renderCount > maxRenders) {
      throw new Error(
        `Hook caused infinite loop: ${renderCount} renders exceeded max of ${maxRenders}`,
      );
    }
    return hookCallback();
  };

  const { result } = renderHook(wrappedHook, { wrapper });
  return { renderCount, result: result.current };
}
