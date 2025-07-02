import { useMediaQuery } from "usehooks-ts";

import { screenBreakPoints } from "@/ui/common/config/screen-breakpoints";

type BreakpointKey = keyof typeof screenBreakPoints;

/**
 * Custom hook to check if the current viewport matches a specific breakpoint
 * @param breakpoint - The breakpoint to check against ("sm" | "md" | "lg" | "xl" | "2xl")
 * @returns boolean indicating if the viewport width is less than or equal to the specified breakpoint
 */
export const useBreakpoint = (breakpoint: BreakpointKey): boolean => {
  const matches = useMediaQuery(
    `(max-width: ${screenBreakPoints[breakpoint]})`,
  );
  return matches;
};

// Returns true if the viewport is mobile
export const useIsMobileView = () => {
  return useBreakpoint("md");
};

// Returns true if the viewport is desktop
export const useIsDesktopView = () => {
  return useBreakpoint("lg");
};

// Returns true if the viewport is large desktop
export const useIsLargeDesktopView = () => {
  return useBreakpoint("xl");
};

// Returns true if the viewport is extra large desktop
export const useIsExtraLargeDesktopView = () => {
  return useBreakpoint("2xl");
};
