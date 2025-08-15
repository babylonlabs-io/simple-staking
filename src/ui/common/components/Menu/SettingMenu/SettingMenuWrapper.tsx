import { Button, SettingMenu } from "@babylonlabs-io/core-ui";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

import { ReportBugIcon, ThemedIcon } from "@babylonlabs-io/core-ui";
import FeatureFlagService from "@/ui/common/utils/FeatureFlagService";

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

  const handleThemeChange = (newTheme: Theme) => {
    setSelectedTheme(newTheme);
    setTheme(newTheme);
  };

  const handleReportBug = () => {
    const reportBugUrl = process.env.NEXT_PUBLIC_REPORT_BUG_URL;
    if (reportBugUrl) {
      window.open(reportBugUrl, "_blank", "noopener,noreferrer");
    }
  };

  const handleTermsOfService = () => {
    // TODO: handle terms of service
  };

  const handlePrivacyPolicy = () => {
    // TODO: handle privacy policy
  };

  const handleSwitchToBaby = () => {
    // TODO: handle switch to Baby Staking
  };

  const getThemeDescription = () => {
    switch (selectedTheme) {
      case "system":
        return "Auto";
      case "light":
        return "Light";
      case "dark":
        return "Dark";
      default:
        return "Auto";
    }
  };

  return (
    <SettingMenu>
      <SettingMenu.Title>Settings</SettingMenu.Title>

      <SettingMenu.Group background="secondary">
        <SettingMenu.SubMenu icon={<ThemeIcon />}>
          Theme
          <SettingMenu.Description>
            {getThemeDescription()}
          </SettingMenu.Description>
          <SettingMenu.Item
            selected={selectedTheme === "system"}
            onClick={() => handleThemeChange("system")}
          >
            Auto
          </SettingMenu.Item>
          <SettingMenu.Item
            selected={selectedTheme === "light"}
            onClick={() => handleThemeChange("light")}
          >
            Light
          </SettingMenu.Item>
          <SettingMenu.Item
            selected={selectedTheme === "dark"}
            onClick={() => handleThemeChange("dark")}
          >
            Dark
          </SettingMenu.Item>
        </SettingMenu.SubMenu>

        <SettingMenu.Item icon={<ReportBugIcon />} onClick={handleReportBug}>
          Report a Bug
        </SettingMenu.Item>
      </SettingMenu.Group>

      <SettingMenu.Spacer />

      <SettingMenu.Group background="secondary">
        <SettingMenu.Item onClick={handleTermsOfService}>
          Terms of Use
        </SettingMenu.Item>
        <SettingMenu.Item onClick={handlePrivacyPolicy}>
          Privacy Policy
        </SettingMenu.Item>
      </SettingMenu.Group>

      {FeatureFlagService.IsBabyStakingEnabled && (
        <>
          <SettingMenu.Spacer />
          <SettingMenu.CustomContent className="my-4 flex justify-center">
            <Button
              className="!bg-[#D5FCE8] !text-black"
              variant="contained"
              onClick={handleSwitchToBaby}
            >
              Switch to BABY Staking
            </Button>
          </SettingMenu.CustomContent>
        </>
      )}
    </SettingMenu>
  );
};
