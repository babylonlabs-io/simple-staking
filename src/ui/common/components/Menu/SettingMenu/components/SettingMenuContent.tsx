import { useTheme } from "next-themes";
import { useState } from "react";

import { ThemeIcon, WarningIcon } from "@/ui/common/components/Icons";

import { DrawerManager } from "./DrawerManager";
import { SettingButton } from "./SettingButton";
import { SettingItem } from "./SettingItem";
import { SettingLink } from "./SettingLink";

export const SettingMenuContent = () => {
  const { theme } = useTheme();

  const [activeDrawer, setActiveDrawer] = useState<string | null>(null);

  const getThemeLabel = () => {
    switch (theme) {
      case "light":
        return "Light";
      case "dark":
        return "Dark";
      default:
        return "Auto";
    }
  };

  const handleReportBug = () => {
    // Handle report bug functionality
  };

  const handleSwitchToBaby = () => {
    // Handle switch to BABY staking functionality
  };

  const handleCloseDrawer = () => {
    setActiveDrawer(null);
  };

  return (
    <div className="relative w-full overflow-hidden">
      {/* Main Menu Content */}
      <div className="w-full">
        <div className="flex flex-col">
          {/* Theme */}
          <SettingItem
            icon={<ThemeIcon />}
            title="Theme"
            subtitle={getThemeLabel()}
            onClick={() => setActiveDrawer("theme")}
          />

          {/* Report Bug */}
          <SettingItem
            icon={<WarningIcon />}
            title="Report a Bug"
            onClick={handleReportBug}
          />

          {/* External Links */}
          <SettingLink title="Terms of Service" href="" />

          <SettingLink title="Privacy Policy" href="" />

          {/* Switch to BABY Staking Button */}
          <SettingButton
            onClick={handleSwitchToBaby}
            variant="primary"
            className="!bg-[#D5FCE8] text-black hover:!bg-[#D5FCE8]/90"
          >
            Switch to BABY Staking
          </SettingButton>
        </div>
      </div>

      {/* Drawer Management */}
      <DrawerManager activeDrawer={activeDrawer} onClose={handleCloseDrawer} />
    </div>
  );
};
