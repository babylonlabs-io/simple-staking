import { Text } from "@babylonlabs-io/core-ui";
import { useTheme } from "next-themes";

import { Drawer } from "../../../Drawer/Drawer";

interface ThemeSelectionDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ThemeSelectionDrawer = ({
  isOpen,
  onClose,
}: ThemeSelectionDrawerProps) => {
  const { theme, setTheme } = useTheme();

  const themeOptions = [
    { key: "system", label: "Auto" },
    { key: "dark", label: "Dark" },
    { key: "light", label: "Light" },
  ];

  const handleThemeSelect = (selectedTheme: string) => {
    setTheme(selectedTheme);
  };

  return (
    <Drawer isOpen={isOpen} onClose={onClose} title="Theme">
      <div className="flex flex-col">
        {themeOptions.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => handleThemeSelect(key)}
            className="flex items-center justify-between w-full px-4 py-3 hover:bg-accent-secondary/5 transition-colors text-left"
          >
            <div className="flex flex-col">
              <Text
                variant="body1"
                className="text-accent-primary font-medium text-sm"
              >
                {label}
              </Text>
            </div>
            {theme === key && (
              <span
                className="text-accent-primary text-sm"
                aria-label="Selected"
              >
                ✓
              </span>
            )}
          </button>
        ))}
      </div>
    </Drawer>
  );
};
