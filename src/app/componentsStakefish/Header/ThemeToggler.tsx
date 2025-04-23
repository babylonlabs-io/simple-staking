import { useCallback } from "react";

import { useAppState } from "@/app/state";
import { Button, type ButtonProps } from "@/ui";

type ThemeTogglerProps = {
  buttonProps?: ButtonProps;
};
export const ThemeToggler = ({ buttonProps }: ThemeTogglerProps) => {
  const { theme, setTheme } = useAppState();

  const toggleTheme = useCallback(() => {
    setTheme(theme === "light" ? "dark" : "light");
  }, [theme, setTheme]);

  return (
    <Button
      size="sm"
      color="transparent"
      icon={{ iconKey: theme === "light" ? "moon" : "sun", size: 16 }}
      onClick={toggleTheme}
      {...buttonProps}
    />
  );
};
