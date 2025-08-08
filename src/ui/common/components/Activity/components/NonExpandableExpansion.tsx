import { Card, Popover, Text, WarningIcon } from "@babylonlabs-io/core-ui";
import { useRef, useState } from "react";
import { twMerge } from "tailwind-merge";

import { STAKE_EXPANSION_MESSAGE } from "@/ui/common/constants";

interface NonExpandableExpansionProps {
  className?: string;
}

export function NonExpandableExpansion({
  className = "",
}: NonExpandableExpansionProps) {
  const [open, setOpen] = useState(false);
  const anchorRef = useRef<HTMLDivElement | null>(null);

  return (
    <div>
      <Card
        className={twMerge(
          "flex items-center justify-between w-full gap-4 p-4",
          className,
        )}
      >
        <div className="flex items-center gap-4">
          <div className="flex flex-col w-full items-start">
            <Text variant="body1" className="text-accent-primary font-medium">
              Stake Expansion
            </Text>
          </div>
        </div>
        <div
          ref={anchorRef}
          onMouseEnter={() => setOpen(true)}
          onMouseLeave={() => setOpen(false)}
          className="cursor-pointer"
        >
          <WarningIcon variant="accent-primary" size={22} />
        </div>
      </Card>
      <Popover
        open={open}
        anchorEl={anchorRef.current}
        placement="top-end"
        onClickOutside={() => setOpen(false)}
        className="bg-surface p-4 rounded border border-secondary-strokeLight w-[18rem] shadow-md"
      >
        <Text variant="body2" className="text-accent-primary">
          {STAKE_EXPANSION_MESSAGE}
        </Text>
      </Popover>
    </div>
  );
}
