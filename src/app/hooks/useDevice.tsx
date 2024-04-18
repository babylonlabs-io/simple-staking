import { mobileViewBreakpoint } from "../constants/view";
import { useMediaQueryClient } from "./useMediaQuery";

// Provide a hook to determine if the user is on a mobile device.
export const useDevice = () => {
  const isMobile = useMediaQueryClient(
    `(max-width: ${mobileViewBreakpoint}px)`,
  );

  return { isMobile, isDesktop: !isMobile };
};
