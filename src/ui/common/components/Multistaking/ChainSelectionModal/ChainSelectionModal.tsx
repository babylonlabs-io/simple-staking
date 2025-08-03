import {
  Button,
  DialogBody,
  DialogFooter,
  DialogHeader,
  FinalityProviderItem,
} from "@babylonlabs-io/core-ui";
import { useMemo } from "react";
import { MdOutlineInfo } from "react-icons/md";
import { twMerge } from "tailwind-merge";

import { ResponsiveDialog } from "@/ui/common/components/Modals/ResponsiveDialog";
import { getNetworkConfigBBN } from "@/ui/common/config/network/bbn";
import { chainLogos } from "@/ui/common/constants";
import { useFinalityProviderState } from "@/ui/common/state/FinalityProviderState";
import { Bsn } from "@/ui/common/types/bsn";
import { FinalityProvider } from "@/ui/common/types/finalityProviders";

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

interface ChainButtonProps {
  disabled?: boolean;
  provider?: FinalityProvider;
  bsnId?: string;
  bsnName?: string;
  logoUrl?: string;
  title?: string | JSX.Element;
  onSelectFp?: () => void;
  onRemove?: (bsnId: string) => void;
}

const ChainButton = ({
  disabled,
  title,
  provider,
  bsnId,
  bsnName,
  logoUrl,
  onSelectFp,
  onRemove,
}: ChainButtonProps) => (
  <div
    className={twMerge(
      provider
        ? "bg-secondary-highlight w-full py-[14px] px-[14px] rounded"
        : "bg-secondary-highlight w-full py-[14px] px-[14px] rounded flex items-center justify-between",
      disabled ? "opacity-50" : "",
    )}
  >
    <div className="flex items-center text-base">
      {provider ? (
        <div className="w-full">
          <FinalityProviderItem
            bsnId={bsnId || ""}
            bsnName={bsnName || ""}
            provider={provider}
            onRemove={() => onRemove?.(bsnId || "")}
          />
        </div>
      ) : (
        <>
          {logoUrl && (
            <img
              src={logoUrl}
              alt="chain-logo"
              className="max-w-[40px] max-h-[40px] mr-2 rounded-full"
            />
          )}
          {title}
        </>
      )}
    </div>
    {!provider && (
      <Button
        variant="outlined"
        disabled={disabled}
        onClick={onSelectFp}
        className="box-border flex items-center justify-center p-1 w-[86px] h-[28px] border border-secondary-strokeDark rounded text-accent-primary text-sm"
      >
        Select FP
      </Button>
    )}
  </div>
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
  onRemove: (bsnId: string) => void;
}

export const ChainSelectionModal = ({
  bsns = [],
  open,
  loading,
  selectedBsns = {},
  onSelect,
  onNext,
  onClose,
  onRemove,
}: ChainSelectionModalProps) => {
  const babylonBsn = useMemo(
    () => bsns.find((bsn) => bsn.id === BSN_ID),
    [bsns],
  );

  const { getFinalityProviderName, finalityProviderMap } =
    useFinalityProviderState();
  const externalBsns = useMemo(
    () => bsns.filter((bsn) => bsn.id !== BSN_ID),
    [bsns],
  );
  const isBabylonSelected = babylonBsn
    ? Boolean(selectedBsns[babylonBsn.id])
    : false;

  // Helper: when user clicks "Select FP" on a chain, choose it and advance.
  const handleSelectFp = (bsnId: string) => {
    onSelect(bsnId);
    onNext();
  };

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
        <div
          className="overflow-y-auto flex flex-col gap-2 mt-10"
          style={{ maxHeight: "min(60vh, 500px)" }}
        >
          {loading && <div>Loading...</div>}
          {babylonBsn && (
            <ChainButton
              provider={
                selectedBsns[babylonBsn.id]
                  ? finalityProviderMap.get(selectedBsns[babylonBsn.id])
                  : undefined
              }
              bsnName={babylonBsn.name}
              bsnId={babylonBsn.id}
              logoUrl={chainLogos.babylon}
              title={
                selectedBsns[babylonBsn.id]
                  ? (getFinalityProviderName(selectedBsns[babylonBsn.id]) ??
                    babylonBsn.name)
                  : babylonBsn.name
              }
              disabled={false}
              onSelectFp={() => handleSelectFp(babylonBsn.id)}
              onRemove={() => onRemove(babylonBsn.id)}
            />
          )}
          {externalBsns.map((bsn) => (
            <ChainButton
              key={bsn.id}
              provider={
                selectedBsns[bsn.id]
                  ? finalityProviderMap.get(selectedBsns[bsn.id])
                  : undefined
              }
              bsnName={bsn.name}
              bsnId={bsn.id}
              logoUrl={chainLogos[bsn.id] || chainLogos.placeholder}
              title={
                selectedBsns[bsn.id]
                  ? (getFinalityProviderName(selectedBsns[bsn.id]) ?? bsn.name)
                  : bsn.name
              }
              disabled={!selectedBsns[bsn.id] && !isBabylonSelected}
              onSelectFp={() => handleSelectFp(bsn.id)}
              onRemove={() => onRemove(bsn.id)}
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
        <Button variant="contained" onClick={onClose}>
          Done
        </Button>
      </DialogFooter>
    </ResponsiveDialog>
  );
};
