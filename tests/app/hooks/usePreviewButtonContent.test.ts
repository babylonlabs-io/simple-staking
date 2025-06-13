/**
 * @jest-environment jsdom
 */

import { renderHook } from "@testing-library/react";

import { usePreviewButtonContent } from "@/ui/hooks/usePreviewButtonContent";

describe("usePreviewButtonContent", () => {
  const baseParams = {
    isValidating: false,
    isLoading: false,
    fieldPriority: [],
  } as const;

  it("returns 'Preview' when there are no errors", () => {
    const { result } = renderHook(() =>
      usePreviewButtonContent({ ...baseParams, errors: {} }),
    );

    expect(result.current).toBe("Preview");
  });

  it("returns 'Calculating...' while validating", () => {
    const { result } = renderHook(() =>
      usePreviewButtonContent({
        ...baseParams,
        isValidating: true,
        errors: {},
      }),
    );

    expect(result.current).toBe("Calculating...");
  });

  it("returns 'Loading...' while loading", () => {
    const { result } = renderHook(() =>
      usePreviewButtonContent({
        ...baseParams,
        isLoading: true,
        errors: {},
      }),
    );

    expect(result.current).toBe("Loading...");
  });

  it("prioritises critical errors over others", () => {
    const { result } = renderHook(() =>
      usePreviewButtonContent({
        ...baseParams,
        errors: {
          amount: { message: "Critical amount error", type: "critical" },
          finalityProvider: {
            message: "Required provider",
            type: "required",
          },
        },
      }),
    );

    expect(result.current).toBe("Critical amount error");
  });

  it("returns required error when no critical error exists", () => {
    const { result } = renderHook(() =>
      usePreviewButtonContent({
        ...baseParams,
        errors: {
          finalityProvider: {
            message: "Provider is required",
            type: "required",
          },
          amount: { message: "Generic amount error", type: "custom" },
        },
      }),
    );

    expect(result.current).toBe("Provider is required");
  });

  it("returns first generic error when neither critical nor required errors exist", () => {
    const { result } = renderHook(() =>
      usePreviewButtonContent({
        ...baseParams,
        errors: {
          amount: { message: "Amount invalid", type: "custom" },
          feeRate: { message: "Fee invalid", type: "custom" },
        },
      }),
    );

    expect(result.current).toBe("Amount invalid");
  });

  describe("fieldPriority handling", () => {
    it("respects fieldPriority ordering for required errors", () => {
      const { result } = renderHook(() =>
        usePreviewButtonContent({
          ...baseParams,
          fieldPriority: ["finalityProvider", "amount"],
          errors: {
            amount: { message: "Amount is required", type: "required" },
            finalityProvider: {
              message: "Provider is required",
              type: "required",
            },
          },
        }),
      );

      expect(result.current).toBe("Provider is required");
    });

    it("falls back to error object order when fieldPriority is empty", () => {
      const { result } = renderHook(() =>
        usePreviewButtonContent({
          ...baseParams,
          errors: {
            amount: { message: "Amount is required", type: "required" },
            finalityProvider: {
              message: "Provider is required",
              type: "required",
            },
          },
        }),
      );

      expect(result.current).toBe("Amount is required");
    });

    it("respects fieldPriority when multiple critical errors are present", () => {
      const { result } = renderHook(() =>
        usePreviewButtonContent({
          ...baseParams,
          fieldPriority: ["feeRate", "amount"],
          errors: {
            amount: { message: "Amount critical", type: "critical" },
            feeRate: { message: "Fee critical", type: "critical" },
          },
        }),
      );

      expect(result.current).toBe("Fee critical");
    });
  });
});
