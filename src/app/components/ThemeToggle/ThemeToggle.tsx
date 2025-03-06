import { Text, Toggle } from "@babylonlabs-io/core-ui";
import { IoIosMoon, IoIosSunny } from "react-icons/io";

import { useAppState } from "@/app/state";

export const ThemeToggle = () => {
  const { theme, setTheme } = useAppState();

  return (
    <div className="flex flex-row items-center justify-between">
      <Text variant="body2" className="text-sm text-accent-primary capitalize">
        {theme} Mode
      </Text>
      <div className="flex flex-col items-center justify-center">
        <Toggle
          defaultValue={theme === "dark"}
          onChange={(value) => {
            setTheme(value ? "dark" : "light");
          }}
          inactiveIcon={<IoIosSunny size={12} />}
          activeIcon={<IoIosMoon size={10} />}
        />
      </div>
    </div>
  );
};
