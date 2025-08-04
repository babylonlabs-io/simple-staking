import {
  Button,
  DialogBody,
  DialogFooter,
  DialogHeader,
  FinalityProviderItem,
} from "@babylonlabs-io/core-ui";
import { useCallback, useMemo } from "react";
import { MdOutlineInfo } from "react-icons/md";
import { twMerge } from "tailwind-merge";

import { ResponsiveDialog } from "@/ui/common/components/Modals/ResponsiveDialog";
import { getNetworkConfigBBN } from "@/ui/common/config/network/bbn";
import { chainLogos } from "@/ui/common/constants";
import { useFinalityProviderState } from "@/ui/common/state/FinalityProviderState";
import type {
  BsnFinalityProviderInfo,
  BsnWithStatus,
  ExpansionBsnDisplay,
} from "@/ui/common/state/StakingExpansionTypes";
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
  isExisting?: boolean;
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
  isExisting = false,
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
            onRemove={isExisting ? undefined : () => onRemove?.(bsnId || "")}
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
  existingBsns?: Record<string, string>;
  bsns?: Bsn[];
  onNext: () => void;
  onClose: () => void;
  onSelect: (bsnId: string) => void;
  onRemove: (bsnId: string) => void;
  onExpand?: () => void;
  expandLoading?: boolean;
  isExpansionMode?: boolean; // Clear intent
}

export const ChainSelectionModal = ({
  bsns = [],
  open,
  loading,
  selectedBsns = {},
  existingBsns = {},
  onSelect,
  onNext,
  onClose,
  onRemove,
  onExpand,
  expandLoading = false,
  isExpansionMode = false,
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
  const isBabylonSelected = Boolean(
    existingBsns?.[BSN_ID] || selectedBsns?.[BSN_ID],
  );

  // Helper function to create display BSN data
  const createDisplayBsns = useCallback((): ExpansionBsnDisplay => {
    // Unified logic - always use expansion-style data structure
    const babylonWithStatus: BsnWithStatus | null = babylonBsn
      ? {
          ...babylonBsn,
          isExisting: Boolean(existingBsns?.[babylonBsn.id]),
          isSelected: Boolean(selectedBsns?.[babylonBsn.id]),
          fpPkHex:
            existingBsns?.[babylonBsn.id] || selectedBsns?.[babylonBsn.id],
        }
      : null;

    const externalWithStatus: BsnWithStatus[] = externalBsns.map((bsn) => ({
      ...bsn,
      isExisting: Boolean(existingBsns?.[bsn.id]),
      isSelected: Boolean(selectedBsns?.[bsn.id]),
      fpPkHex: existingBsns?.[bsn.id] || selectedBsns?.[bsn.id],
    }));

    // Only sort in expansion mode (when there are existing BSNs)
    if (Object.keys(existingBsns || {}).length > 0) {
      externalWithStatus.sort((a, b) => {
        if (a.isExisting && !b.isExisting) return -1;
        if (!a.isExisting && b.isExisting) return 1;
        return 0;
      });
    }

    return { babylon: babylonWithStatus, external: externalWithStatus };
  }, [babylonBsn, externalBsns, existingBsns, selectedBsns]);

  // Helper function to get finality provider info for a BSN
  const getBsnFinalityProviderInfo = useCallback(
    (bsn: Bsn | BsnWithStatus): BsnFinalityProviderInfo => {
      // Unified logic: always use expansion-style data structure
      const fpPkHex = (bsn as BsnWithStatus)?.fpPkHex || selectedBsns[bsn.id];

      const provider = fpPkHex ? finalityProviderMap.get(fpPkHex) : undefined;
      const title = fpPkHex
        ? (getFinalityProviderName(fpPkHex) ?? bsn.name)
        : bsn.name;

      // Unified logic: check if BSN exists in either existing or selected
      const isExisting = Boolean(existingBsns?.[bsn.id]);

      // Unified disable logic:
      // - Existing BSNs are disabled (can't re-select them, including Babylon)
      // - Other BSNs are disabled until Babylon is selected
      const isDisabled = isExpansionMode
        ? isExisting // In expansion mode, disable existing BSNs
        : bsn.id === BSN_ID
          ? false
          : !isBabylonSelected; // In regular mode, Babylon-first rule

      return {
        fpPkHex,
        provider,
        title,
        isDisabled,
        isExisting,
      };
    },
    [
      selectedBsns,
      existingBsns,
      finalityProviderMap,
      getFinalityProviderName,
      isExpansionMode,
      isBabylonSelected,
    ],
  );

  // Create comprehensive BSN display list for expansion mode
  const displayBsns = useMemo(() => createDisplayBsns(), [createDisplayBsns]);

  // Helper: when user clicks "Select FP" on a chain, choose it and advance.
  const handleSelectFp = useCallback(
    (bsnId: string) => {
      // Unified validation: prevent selecting BSNs that already have FPs
      if (existingBsns?.[bsnId]) {
        return; // Can't select existing BSNs (expansion mode only)
      }
      onSelect(bsnId);
      onNext();
    },
    [existingBsns, onSelect, onNext],
  );

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
          {!loading &&
            displayBsns.babylon &&
            (() => {
              const bsnInfo = getBsnFinalityProviderInfo(displayBsns.babylon);
              return (
                <ChainButton
                  provider={bsnInfo.provider}
                  bsnName={displayBsns.babylon.name}
                  bsnId={displayBsns.babylon.id}
                  logoUrl={chainLogos.babylon}
                  title={bsnInfo.title}
                  disabled={bsnInfo.isDisabled}
                  isExisting={bsnInfo.isExisting}
                  onSelectFp={() =>
                    displayBsns.babylon &&
                    handleSelectFp(displayBsns.babylon.id)
                  }
                  onRemove={() =>
                    displayBsns.babylon && onRemove(displayBsns.babylon.id)
                  }
                />
              );
            })()}
          {!loading &&
            displayBsns.external.map((bsn) => {
              const bsnInfo = getBsnFinalityProviderInfo(bsn);
              return (
                <ChainButton
                  key={bsn.id}
                  provider={bsnInfo.provider}
                  bsnName={bsn.name}
                  bsnId={bsn.id}
                  logoUrl={chainLogos[bsn.id] || chainLogos.placeholder}
                  title={bsnInfo.title}
                  disabled={bsnInfo.isDisabled}
                  isExisting={bsnInfo.isExisting}
                  onSelectFp={() => handleSelectFp(bsn.id)}
                  onRemove={() => onRemove(bsn.id)}
                />
              );
            })}
        </div>
        {!isBabylonSelected && Object.keys(existingBsns || {}).length === 0 && (
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

      <DialogFooter className="flex justify-between">
        <Button variant="outlined" onClick={onClose}>
          Cancel
        </Button>
        <div className="flex gap-2">
          {Object.keys(existingBsns || {}).length > 0 &&
            Object.keys(selectedBsns).length > 0 &&
            onExpand && (
              <Button
                variant="contained"
                onClick={onExpand}
                disabled={expandLoading}
              >
                {expandLoading ? "Calculating..." : "Expand"}
              </Button>
            )}
          {Object.keys(existingBsns || {}).length === 0 && (
            <Button
              variant="contained"
              onClick={Object.keys(selectedBsns).length > 0 ? onClose : onNext}
            >
              Done
            </Button>
          )}
        </div>
      </DialogFooter>
    </ResponsiveDialog>
  );
};
