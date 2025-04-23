import { useState } from "react";

import { useMediaQueryContext } from "@/app/context/ui/MediaQueryContext";
import { Button, cx, Dropdown } from "@/ui";

import { dashboardNavs, ProtocolVariants } from "./utils";

export const NetworkDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { down } = useMediaQueryContext();
  const isMd = down?.salmon;

  return (
    <Dropdown.Root
      modal={false}
      open={isOpen}
      onOpenChange={(open) => {
        setIsOpen(Boolean(open));
      }}
    >
      <Dropdown.Trigger asChild>
        <Button
          application
          size="sm"
          color="secondary"
          startIcon={{ iconKey: dashboardNavs["babylon"].logo, size: 14 }}
          endIcon={{ iconKey: isOpen ? "chevronUp" : "chevronDown", size: 14 }}
          className={cx(
            "data-[state=open]:ring-itemSecondaryDefault hover:ring-itemSecondaryDefault ring-itemPrimaryDefaultAlt2 ring-1 ring-inset disabled:backgroundSecondaryOnDefault h-full py-[9px] flounder:!py-[9px] salmon:!py-1.5 gap-1 !px-3",
          )}
        >
          {!isMd ? dashboardNavs["babylon"].displayName : undefined}
        </Button>
      </Dropdown.Trigger>
      <Dropdown.Content
        align="end"
        sideOffset={11}
        className="w-[180px] pointer-events-auto"
      >
        {ProtocolVariants.map((protocol, index) => {
          const isConnected = dashboardNavs[protocol].displayName === "Babylon";
          return (
            <Dropdown.Item key={index} className="mb-px" asChild>
              <Button
                size="sm"
                variant="menuItem"
                endIcon={
                  isConnected
                    ? { iconKey: "checkCircleFilled", size: 14 }
                    : undefined
                }
                disabled={isConnected}
                className={cx(
                  "justify-between disabled:backgroundSecondaryOnDefault",
                  isConnected && "!bg-backgroundPrimaryMute",
                )}
                href={dashboardNavs[protocol].link}
              >
                {dashboardNavs[protocol].displayName}
              </Button>
            </Dropdown.Item>
          );
        })}
      </Dropdown.Content>
    </Dropdown.Root>
  );
};
