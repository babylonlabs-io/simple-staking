import {
  Button,
  DialogBody,
  DialogFooter,
  DialogHeader,
  Text,
} from "@babylonlabs-io/core-ui";
import { PropsWithChildren, useMemo } from "react";
import { MdOutlineInfo } from "react-icons/md";
import { twMerge } from "tailwind-merge";

import { ResponsiveDialog } from "@/ui/common/components/Modals/ResponsiveDialog";
import { getNetworkConfigBBN } from "@/ui/common/config/network/bbn";
import { chainLogos } from "@/ui/common/constants";
import { Bsn } from "@/ui/common/types/bsn";

const BSN_ID = getNetworkConfigBBN().chainId;

const SubSection = ({
  children,
  style,
  className,
}: {
  children: React.ReactNode;
  style?: React.CSSProperties;
  className?: string;
}) => (
  <div
    className={twMerge(
      "flex bg-secondary-highlight text-accent-primary p-4",
      className,
    )}
    style={style}
  >
    {children}
  </div>
);

interface ChainButtonProps extends PropsWithChildren {
  className?: string;
  disabled?: boolean;
  logo?: string;
  title?: string | JSX.Element;
  alt?: string;
  selected?: boolean;
  onClick?: () => void;
}

const ChainButton = ({
  className,
  disabled,
  title,
  logo,
  selected,
  onClick,
}: ChainButtonProps) => (
  <Text
    disabled={disabled}
    as="button"
    className={twMerge(
      "bg-secondary-highlight w-full py-[14px] px-6 pl-[14px] rounded border",
      selected ? "border-[#CE6533]" : "border-transparent",
      disabled
        ? "opacity-50 pointer-events-none cursor-default"
        : "cursor-pointer",
      className,
    )}
    onClick={onClick}
  >
    <div className="flex w-full items-center justify-between">
      <div className="flex items-center text-base">
        {logo && (
          <img
            src={logo}
            alt="bitcoin"
            className="max-w-[40px] max-h-[40px] mr-2 rounded-full"
          />
        )}
        {title}
      </div>
    </div>
  </Text>
);

interface ChainSelectionModalProps {
  open: boolean;
  loading?: boolean;
  activeBsnId?: string;
  selectedBsns?: Record<string, string>;
  bsns?: Bsn[];
  onNext: () => void;
  onClose: () => void;
  onSelect: (bsnId: string) => void;
}

export const ChainSelectionModal = ({
  bsns = [],
  open,
  loading,
  activeBsnId,
  selectedBsns = {},
  onSelect,
  onNext,
  onClose,
}: ChainSelectionModalProps) => {
  const babylonBsn = useMemo(
    () => bsns.find((bsn) => bsn.id === BSN_ID),
    [bsns],
  );
  const externalBsns = useMemo(
    () => bsns.filter((bsn) => bsn.id !== BSN_ID),
    [bsns],
  );
  const isBabylonSelected = babylonBsn
    ? Boolean(selectedBsns[babylonBsn.id])
    : false;

  return (
    <ResponsiveDialog open={open} onClose={onClose} className="w-[52rem]">
      <DialogHeader
        title="Select Babylon Secured Network"
        onClose={onClose}
        className="text-accent-primary"
      />

      <DialogBody className="flex flex-col mb-4 mt-4 text-accent-primary">
        <div>
          Bitcoin Supercharged Networks (BSNs) are Proof-of-Stake systems
          secured by Bitcoin staking. Select a network to delegate your stake.
        </div>
        <div className="overflow-y-auto max-h-[350px] flex flex-col gap-2 mt-10">
          {loading && <div>Loading...</div>}
          {babylonBsn && (
            <ChainButton
              logo={chainLogos.babylon}
              title={babylonBsn.name}
              selected={activeBsnId === babylonBsn.id}
              disabled={isBabylonSelected}
              onClick={() => onSelect(babylonBsn.id)}
            />
          )}
          {externalBsns.map((bsn) => (
            <ChainButton
              key={bsn.id}
              logo={chainLogos[bsn.id] || chainLogos.placeholder}
              title={bsn.name}
              selected={activeBsnId === bsn.id}
              disabled={Boolean(selectedBsns[bsn.id]) || !isBabylonSelected}
              onClick={() => onSelect(bsn.id)}
            />
          ))}
        </div>
        {!isBabylonSelected && (
          <SubSection className="text-base text-[#387085] gap-3 flex-row mt-4">
            <div>
              <MdOutlineInfo size={22} />
            </div>
            <div>
              Babylon Genesis must be the first BSN you add before selecting
              others. Once added, you can choose additional BSNs to multi-stake.
            </div>
          </SubSection>
        )}
      </DialogBody>

      <DialogFooter className="flex justify-end">
        <Button
          variant="contained"
          onClick={onNext}
          disabled={activeBsnId === undefined}
        >
          Next
        </Button>
      </DialogFooter>
    </ResponsiveDialog>
  );
};
