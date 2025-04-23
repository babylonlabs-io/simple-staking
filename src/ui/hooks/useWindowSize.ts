import { useEffect, useState } from "react";

interface WindowSize {
  width: number;
  height: number;
}

export default function useWindowSize() {
  const [windowSize, setWindowSize] = useState<WindowSize | undefined>();

  useEffect(() => {
    function handleResize() {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }

    handleResize();

    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return windowSize;
}
