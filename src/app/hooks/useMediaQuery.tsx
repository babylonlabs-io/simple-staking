import { useEffect, useState } from "react";

// https://github.com/chakra-ui/chakra-ui/issues/3580
export const useMediaQueryClient = (mediaQueryString: string) => {
  const [matches, setMatches] = useState<boolean>();

  useEffect(() => {
    const mediaQueryList = window.matchMedia(mediaQueryString);
    const listener = () => setMatches(!!mediaQueryList.matches);
    listener();
    mediaQueryList.addEventListener("change", listener); // updated from .addListener
    return () => mediaQueryList.removeEventListener("change", listener); // updated from .removeListener
  }, [mediaQueryString]);

  return matches;
};
