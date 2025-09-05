import { Popover, Text } from "@babylonlabs-io/core-ui";
import { useState } from "react";

import { ThreeDotsMenuIcon } from "@/ui/common/components/Icons/common/ThreeDotsMenuIcon";

interface ThreeDotsMenuProps {
  onChange: () => void;
  onRemove: () => void;
  className?: string;
}

export const ThreeDotsMenu = ({
  onChange,
  onRemove,
  className,
}: ThreeDotsMenuProps) => {
  const [open, setOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

  return (
    <>
      <button
        ref={setAnchorEl}
        onClick={() => setOpen(!open)}
        className={className}
        aria-label="Open options"
      >
        <ThreeDotsMenuIcon
          size={20}
          className="text-accent-primary dark:text-white"
        />
      </button>

      <Popover
        open={open}
        anchorEl={anchorEl}
        placement="bottom-end"
        onClickOutside={() => setOpen(false)}
        className="bg-surface p-4 rounded border border-secondary-strokeLight w-60 shadow-md"
      >
        <div className="flex flex-col gap-6">
          <Text
            variant="body2"
            as="button"
            onClick={() => {
              onChange();
              setOpen(false);
            }}
            className="flex items-center gap-1 text-accent-primary transition-all hover:brightness-125"
          >
            Change FP
          </Text>
          <Text
            variant="body2"
            as="button"
            onClick={() => {
              onRemove();
              setOpen(false);
            }}
            className="flex items-center gap-1 text-accent-primary transition-all hover:brightness-125"
          >
            Remove BSN
          </Text>
        </div>
      </Popover>
    </>
  );
};
