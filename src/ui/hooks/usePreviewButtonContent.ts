// Removed unused React import to avoid triggering the TypeScript `noUnusedLocals` rule.

import { STAKING_DISABLED } from "@/ui/constants";

interface UsePreviewButtonContentProps {
  errors: Record<string, any>;
  isValidating: boolean;
  isLoading: boolean;
  fieldPriority?: readonly string[];
}

/**
 * Provides the text content that should be rendered inside the multistaking preview button
 * based on the current form state and validation errors.
 */
export function usePreviewButtonContent({
  errors,
  isValidating,
  isLoading,
  fieldPriority = [],
}: UsePreviewButtonContentProps): string {
  const errorKeys = Object.keys(errors);
  const errorMessages = errorKeys.map((key) => errors[key]?.message);
  const hasError = errorMessages.length > 0;

  if (STAKING_DISABLED) {
    return "Preview";
  }

  if (isValidating) {
    return "Calculating...";
  }

  if (isLoading) {
    return "Loading...";
  }

  if (hasError) {
    const prioritizedKeys =
      fieldPriority.length > 0 ? fieldPriority : errorKeys;

    const findKey = (predicate: (key: string) => boolean) =>
      prioritizedKeys.find((key) => predicate(key) && errors[key]);

    const criticalKey = findKey((k) => errors[k]?.type === "critical");
    if (criticalKey) {
      return errors[criticalKey]?.message?.toString() || "";
    }

    const requiredKey = findKey((k) => errors[k]?.type === "required");
    if (requiredKey) {
      return errors[requiredKey]?.message?.toString() || "";
    }

    const firstKey = prioritizedKeys.find((k) => errors[k]);
    if (firstKey) {
      return errors[firstKey]?.message?.toString() || "";
    }

    return errorMessages[0]?.toString() || "";
  }

  return "Preview";
}
