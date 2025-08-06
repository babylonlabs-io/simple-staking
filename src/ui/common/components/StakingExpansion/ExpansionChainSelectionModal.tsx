import {
  Button,
  DialogBody,
  DialogFooter,
  DialogHeader,
} from "@babylonlabs-io/core-ui";
import { useCallback, useMemo } from "react";

import { ResponsiveDialog } from "@/ui/common/components/Modals/ResponsiveDialog";
import { ChainButton } from "@/ui/common/components/Multistaking/ChainSelectionModal/shared";
import { getNetworkConfigBBN } from "@/ui/common/config/network/bbn";
import { chainLogos } from "@/ui/common/constants";
import { useFinalityProviderState } from "@/ui/common/state/FinalityProviderState";
import type {
  BsnFinalityProviderInfo,
  BsnWithStatus,
  ExpansionBsnDisplay,
} from "@/ui/common/state/StakingExpansionTypes";
import { Bsn } from "@/ui/common/types/bsn";

const BSN_ID = getNetworkConfigBBN().chainId;

interface ExpansionChainSelectionModalProps {
  open: boolean;
  loading?: boolean;
  selectedBsns?: Record<string, string>;
  existingBsns?: Record<string, string>;
  bsns?: Bsn[];
  onNext: () => void;
  onClose: () => void;
  onSelect: (bsnId: string) => void;
  onRemove: (bsnId: string) => void;
  onExpand?: () => void;
  expandLoading?: boolean;
}

export const ExpansionChainSelectionModal = ({
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
}: ExpansionChainSelectionModalProps) => {
  const babylonBsn = useMemo(
    () => bsns.find((bsn) => bsn.id === BSN_ID),
    [bsns],
  );

  const { getFinalityProviderName, finalityProviderMap } =
    useFinalityProviderState();

  // Helper function to create display BSN data for expansion mode
  const createDisplayBsns = useCallback((): ExpansionBsnDisplay => {
    const babylonWithStatus: BsnWithStatus | null = babylonBsn
      ? {
          ...babylonBsn,
          isExisting: Boolean(existingBsns?.[babylonBsn.id]),
          isSelected: Boolean(selectedBsns?.[babylonBsn.id]),
          fpPkHex:
            existingBsns?.[babylonBsn.id] || selectedBsns?.[babylonBsn.id],
        }
      : null;

    const externalWithStatus: BsnWithStatus[] = bsns
      .filter((bsn) => bsn.id !== BSN_ID)
      .map((bsn) => ({
        ...bsn,
        isExisting: Boolean(existingBsns?.[bsn.id]),
        isSelected: Boolean(selectedBsns?.[bsn.id]),
        fpPkHex: existingBsns?.[bsn.id] || selectedBsns?.[bsn.id],
      }))
      .sort((a, b) => {
        if (a.isExisting && !b.isExisting) return -1;
        if (!a.isExisting && b.isExisting) return 1;
        return 0;
      });

    return { babylon: babylonWithStatus, external: externalWithStatus };
  }, [babylonBsn, existingBsns, selectedBsns, bsns]);

  // Helper function to get finality provider info for a BSN in expansion mode
  const getBsnFinalityProviderInfo = useCallback(
    (bsn: BsnWithStatus): BsnFinalityProviderInfo => {
      const fpPkHex = bsn.fpPkHex;
      const provider = fpPkHex ? finalityProviderMap.get(fpPkHex) : undefined;
      const title = fpPkHex
        ? (getFinalityProviderName(fpPkHex) ?? bsn.name)
        : bsn.name;

      const isExisting = bsn.isExisting;
      const isDisabled = isExisting; // In expansion mode, existing BSNs are disabled

      return {
        fpPkHex,
        provider,
        title,
        isDisabled,
        isExisting,
      };
    },
    [finalityProviderMap, getFinalityProviderName],
  );

  // Create comprehensive BSN display list for expansion mode
  const displayBsns = useMemo(() => createDisplayBsns(), [createDisplayBsns]);

  // Helper: when user clicks "Select FP" on a chain, choose it and advance.
  const handleSelectFp = useCallback(
    (bsnId: string) => {
      // Prevent selecting BSNs that already have FPs in expansion mode
      if (existingBsns?.[bsnId] || selectedBsns?.[bsnId]) {
        return;
      }
      onSelect(bsnId);
      onNext();
    },
    [existingBsns, selectedBsns, onSelect, onNext],
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
      </DialogBody>

      <DialogFooter className="flex justify-between">
        <Button variant="outlined" onClick={onClose}>
          Cancel
        </Button>
        <div className="flex gap-2">
          {Object.keys(selectedBsns).length > 0 && onExpand && (
            <Button
              variant="contained"
              onClick={onExpand}
              disabled={expandLoading}
            >
              {expandLoading ? "Calculating..." : "Expand"}
            </Button>
          )}
        </div>
      </DialogFooter>
    </ResponsiveDialog>
  );
};
