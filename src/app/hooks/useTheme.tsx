import { useEffect, useState } from "react";
import { useTheme as useThemeFromNextThemes } from "next-themes";

export const useTheme = () => {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useThemeFromNextThemes();
  const lightSelected = theme === "light";
  const darkSelected = theme === "dark";

  // useEffect only runs on the client, so now we can safely show the UI
  useEffect(() => {
    setMounted(true);
  }, []);

  return { theme, setTheme, lightSelected, darkSelected };
};
