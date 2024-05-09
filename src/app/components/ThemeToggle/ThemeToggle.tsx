import { FiSun, FiMoon } from "react-icons/fi";

import { useTheme } from "@/app/hooks/useTheme";

interface ThemeToggleProps {}

// implementation so we avoid hydration error:
// https://github.com/pacocoursey/next-themes#avoid-hydration-mismatch
export const ThemeToggle: React.FC<ThemeToggleProps> = () => {
  const { setTheme, lightSelected } = useTheme();

  const getPrimaryActive = () => {
    if (lightSelected) {
      return "bg-white";
    } else {
      return "bg-primary";
    }
  };

  const iconStyles = (active: boolean) =>
    `rounded-full p-1 transition duration-300 ease-in-out ${
      active ? getPrimaryActive() : "bg-transparent"
    }`;

  return (
    <button
      onClick={() => (lightSelected ? setTheme("dark") : setTheme("light"))}
      className={`flex gap-1 rounded-full bg-base-100 p-2 dark:bg-base-300 ${lightSelected ? "text-black" : "text-white"}`}
    >
      <div className={`${iconStyles(lightSelected)}`}>
        <FiSun size={16} />
      </div>
      <div className={`${iconStyles(!lightSelected)}`}>
        <FiMoon size={16} />
      </div>
    </button>
  );
};
