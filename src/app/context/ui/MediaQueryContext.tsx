import { createContext, useContext, useEffect, useState } from "react";

import { useSafeMediaQuery, utils } from "@/ui";
import type { MediaQueries } from "@/ui/types";

interface MediaQueryContextProps {
  up: Record<MediaQueries.Breakpoint, boolean | null> | null;
  down: Record<MediaQueries.Breakpoint, boolean | null> | null;
}

const MediaQueryContext = createContext<MediaQueryContextProps>({
  up: null,
  down: null,
});

interface MediaQueryContextProviderProps {
  children: React.ReactNode;
}

export const MediaQueryContextProvider = ({
  children,
}: MediaQueryContextProviderProps) => {
  const [mounted, setMounted] = useState(false);

  const variants = {
    up: {
      initial: useSafeMediaQuery(`(min-width: ${utils.breakpoints.initial}px)`),
      trout: useSafeMediaQuery(`(min-width: ${utils.breakpoints.trout}px)`),
      perch: useSafeMediaQuery(`(min-width: ${utils.breakpoints.perch}px)`),
      flounder: useSafeMediaQuery(
        `(min-width: ${utils.breakpoints.flounder}px)`,
      ),
      salmon: useSafeMediaQuery(`(min-width: ${utils.breakpoints.salmon}px)`),
      tuna: useSafeMediaQuery(`(min-width: ${utils.breakpoints.tuna}px)`),
      whale: useSafeMediaQuery(`(min-width: ${utils.breakpoints.whale}px)`),
      whaleShark: useSafeMediaQuery(
        `(min-width: ${utils.breakpoints.whaleShark}px)`,
      ),
    },
    down: {
      initial: useSafeMediaQuery(`(min-width: ${utils.breakpoints.initial}px)`),
      trout: useSafeMediaQuery(`(max-width: ${utils.breakpoints.trout - 1}px)`),
      perch: useSafeMediaQuery(`(min-width: ${utils.breakpoints.perch - 1}px)`),
      flounder: useSafeMediaQuery(
        `(max-width: ${utils.breakpoints.flounder - 1}px)`,
      ),
      salmon: useSafeMediaQuery(
        `(max-width: ${utils.breakpoints.salmon - 1}px)`,
      ),
      tuna: useSafeMediaQuery(`(max-width: ${utils.breakpoints.tuna - 1}px)`),
      whale: useSafeMediaQuery(`(max-width: ${utils.breakpoints.whale - 1}px)`),
      whaleShark: useSafeMediaQuery(
        `(max-width: ${utils.breakpoints.whaleShark - 1}px)`,
      ),
    },
  };
  useEffect(() => setMounted(true), []);

  return (
    <MediaQueryContext.Provider
      value={{
        up: mounted ? variants.up : null,
        down: mounted ? variants.down : null,
      }}
    >
      {children}
    </MediaQueryContext.Provider>
  );
};

export const useMediaQueryContext = () => useContext(MediaQueryContext);
