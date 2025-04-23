import { useEffect, useState } from "react";

interface PrefersReducedMotionOptions {
  ssr?: boolean;
}

function usePrefersReducedMotion(
  options: PrefersReducedMotionOptions = {},
): boolean {
  const { ssr = false } = options;

  const [prefersReducedMotion, setPrefersReducedMotion] =
    useState<boolean>(ssr);

  useEffect(() => {
    if (!window.matchMedia) {
      setPrefersReducedMotion(false);
      return;
    }

    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    setPrefersReducedMotion(mediaQuery.matches);

    function onChange(event: MediaQueryListEvent): void {
      setPrefersReducedMotion(event.matches);
    }

    mediaQuery.addEventListener("change", onChange);

    return () => {
      mediaQuery.removeEventListener("change", onChange);
    };
  }, []);

  return prefersReducedMotion;
}

export default usePrefersReducedMotion;
