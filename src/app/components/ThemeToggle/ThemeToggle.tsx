import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { FiMoon, FiSun } from "react-icons/fi";

interface ThemeToggleProps {}

// implementation so we avoid hydration error:
// https://github.com/pacocoursey/next-themes#avoid-hydration-mismatch
export const ThemeToggle: React.FC<ThemeToggleProps> = () => {
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme, setTheme } = useTheme();

  // useEffect only runs on the client, so now we can safely show the UI
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex h-[40px] w-[68px] items-center justify-center gap-1 rounded-full bg-base-100 p-2">
        <span className="loading loading-spinner loading-xs text-primary" />
      </div>
    );
  }

  const lightSelected = resolvedTheme === "light";

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
      className="flex gap-1 rounded-full bg-base-100 p-2 outline-none hidden"
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
