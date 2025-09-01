import {
  BugReportIcon,
  SettingMenu,
  ThemeIcon,
  ThemedIcon,
} from "@babylonlabs-io/core-ui";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { FaMoon, FaSun } from "react-icons/fa";

type Theme = "light" | "dark" | "system";

export const SettingMenuWrapper = () => {
  const { theme, setTheme } = useTheme();
  const [selectedTheme, setSelectedTheme] = useState<Theme>(
    (theme as Theme) || "system",
  );

  useEffect(() => {
    if (theme) {
      setSelectedTheme(theme as Theme);
    }
  }, [theme]);

  const isLightMode = selectedTheme === "light";

  const handleToggleTheme = (isLight: boolean) => {
    const newTheme = isLight ? "light" : "dark";
    setSelectedTheme(newTheme);
    setTheme(newTheme);
  };

  const handleReportBug = () => {
    const reportBugUrl = process.env.NEXT_PUBLIC_REPORT_BUG_URL;
    if (reportBugUrl) {
      window.open(reportBugUrl, "_blank", "noopener,noreferrer");
    }
  };

  const handleTermsOfUse = () => {
    window.open(
      "https://babylonlabs.io/terms-of-use",
      "_blank",
      "noopener,noreferrer",
    );
  };

  const handlePrivacyPolicy = () => {
    window.open(
      "https://babylonlabs.io/privacy-policy",
      "_blank",
      "noopener,noreferrer",
    );
  };

  const getThemeDescription = () => {
    return isLightMode ? "Light mode" : "Dark mode";
  };

  return (
    <SettingMenu>
      <SettingMenu.Title>Settings</SettingMenu.Title>

      <SettingMenu.Group background="secondary">
        <SettingMenu.Item
          icon={<ThemeIcon />}
          toggle={{
            value: isLightMode,
            onChange: handleToggleTheme,
            activeIcon: <FaSun size={10} />,
            inactiveIcon: <FaMoon size={10} />,
          }}
        >
          Theme
          <SettingMenu.Description>
            {getThemeDescription()}
          </SettingMenu.Description>
        </SettingMenu.Item>

        <SettingMenu.Item
          icon={
            <ThemedIcon background rounded>
              <BugReportIcon />
            </ThemedIcon>
          }
          onClick={handleReportBug}
        >
          Report a Bug
        </SettingMenu.Item>
      </SettingMenu.Group>

      <SettingMenu.Group>
        <SettingMenu.Item onClick={handleTermsOfUse}>
          Terms of Use
        </SettingMenu.Item>

        <SettingMenu.Item onClick={handlePrivacyPolicy}>
          Privacy Policy
        </SettingMenu.Item>
      </SettingMenu.Group>
    </SettingMenu>
  );
};
