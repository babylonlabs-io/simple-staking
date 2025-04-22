import { useEffect, useState } from "react";

export default function useSafeMediaQuery(query: string) {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mediaQueryList = window.matchMedia(query);
    const listener = () => setMatches(Boolean(mediaQueryList.matches));
    listener();
    mediaQueryList.addEventListener("change", listener); // updated from .addListener
    return () => mediaQueryList.removeEventListener("change", listener); // updated from .removeListener
  }, [matches, query]);

  if (typeof window === "undefined") {
    // useSafeMediaQuery() can not be used outside of the browser
    return null;
  }

  return matches;
}
