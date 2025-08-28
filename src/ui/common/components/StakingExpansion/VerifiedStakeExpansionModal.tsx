import {
  Button,
  DialogBody,
  DialogFooter,
  DialogHeader,
  Text,
} from "@babylonlabs-io/core-ui";
import { useMemo, useState } from "react";
import { BiSolidBadgeCheck } from "react-icons/bi";

import { ResponsiveDialog } from "@/ui/common/components/Modals/ResponsiveDialog";
import { getNetworkConfigBBN } from "@/ui/common/config/network/bbn";
import { getNetworkConfigBTC } from "@/ui/common/config/network/btc";
import { EXPANSION_OPERATIONS } from "@/ui/common/constants";
import { useVerifiedStakingExpansionService } from "@/ui/common/hooks/services/useVerifiedStakingExpansionService";
import { useDelegationV2State } from "@/ui/common/state/DelegationV2State";
import { useFinalityProviderBsnState } from "@/ui/common/state/FinalityProviderBsnState";
import { useFinalityProviderState } from "@/ui/common/state/FinalityProviderState";
import { DelegationV2 } from "@/ui/common/types/delegationsV2";
import { satoshiToBtc } from "@/ui/common/utils/btc";
import { maxDecimals } from "@/ui/common/utils/maxDecimals";
import { trim } from "@/ui/common/utils/trim";

const { chainId: BBN_CHAIN_ID } = getNetworkConfigBBN();
const { coinSymbol } = getNetworkConfigBTC();

// Helper function to determine expansion operation type
const getExpansionType = (
  expansion: DelegationV2,
  original: DelegationV2 | undefined,
) => {
  if (!original) {
    // If we can't find original, assume it's adding BSN/FP based on having previous tx
    return EXPANSION_OPERATIONS.ADD_BSN_FP;
  }

  const newFPs = expansion.finalityProviderBtcPksHex.filter(
    (fp) => !original.finalityProviderBtcPksHex.includes(fp),
  );
  const fpsChanged = newFPs.length > 0;

  if (fpsChanged) {
    return EXPANSION_OPERATIONS.ADD_BSN_FP; // Adding BSN/FP (always includes timelock renewal)
  } else {
    return EXPANSION_OPERATIONS.RENEW_TIMELOCK; // Pure timelock renewal only
  }

  // TODO: Future expansion types to consider:
  // - INCREASE_AMOUNT (when staking amount > original amount)
  // - Mixed operations may be possible in future versions
};

interface VerifiedStakeExpansionModalProps {
  open: boolean;
  onClose: () => void;
  processing?: boolean;
}

interface VerifiedExpansionItemProps {
  delegation: DelegationV2;
  onExpand: () => void;
  processing: boolean;
}

function VerifiedExpansionItem({
  delegation,
  onExpand,
  processing,
}: VerifiedExpansionItemProps) {
  const { findDelegationByTxHash } = useDelegationV2State();
  const { getRegisteredFinalityProvider } = useFinalityProviderState();
  const { bsnList } = useFinalityProviderBsnState();

  // Parse BSN and FP information with proper expansion type detection
  const { bsnFpPairs, newCount, operationType, originalDelegation } =
    useMemo(() => {
      const pairs: Array<{ bsnName: string; fpName: string; isNew: boolean }> =
        [];

      // Find the original delegation if this is an expansion
      const original = delegation.previousStakingTxHashHex
        ? findDelegationByTxHash(delegation.previousStakingTxHashHex)
        : undefined;

      // Determine the operation type
      const opType = getExpansionType(delegation, original);

      // Create BSN/FP pairs with correct "new" detection
      delegation.finalityProviderBtcPksHex.forEach((fpPkHex) => {
        const provider = getRegisteredFinalityProvider(fpPkHex);
        const bsnId = provider?.bsnId || BBN_CHAIN_ID;
        const bsn = bsnList.find((b) => b.id === bsnId);

        // Determine if this FP is new by checking if it exists in original delegation
        const isNewFP = original
          ? !original.finalityProviderBtcPksHex.includes(fpPkHex)
          : false; // If no original delegation found, don't mark as new

        pairs.push({
          bsnName: bsn?.name || "Babylon Genesis",
          fpName: provider?.description?.moniker || trim(fpPkHex, 8),
          isNew: isNewFP,
        });
      });

      const newPairsCount = pairs.filter((p) => p.isNew).length;
      return {
        bsnFpPairs: pairs,
        newCount: newPairsCount,
        operationType: opType,
        originalDelegation: original,
      };
    }, [
      delegation,
      findDelegationByTxHash,
      getRegisteredFinalityProvider,
      bsnList,
    ]);

  const stakingAmount = maxDecimals(satoshiToBtc(delegation.stakingAmount), 8);

  return (
    <div className="border border-secondary-strokeLight rounded-lg p-4 space-y-3">
      <div className="flex items-start justify-between">
        <div className="space-y-2 flex-1">
          <div className="flex items-center gap-2">
            <BiSolidBadgeCheck className="text-xl text-primary-light" />
            <Text variant="body1" className="font-medium text-accent-primary">
              {operationType === EXPANSION_OPERATIONS.RENEW_TIMELOCK
                ? "Timelock Renewal"
                : operationType === EXPANSION_OPERATIONS.ADD_BSN_FP
                  ? "BSN/FP Expansion"
                  : "Verified Expansion"}
            </Text>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Text variant="body2" className="text-accent-secondary">
                Amount:
              </Text>
              <Text variant="body2" className="text-accent-primary">
                {stakingAmount} {coinSymbol}
              </Text>
            </div>

            <div className="flex items-center gap-2">
              <Text variant="body2" className="text-accent-secondary">
                Transaction:
              </Text>
              <Text variant="body2" className="text-accent-primary font-mono">
                {trim(delegation.stakingTxHashHex, 10)}
              </Text>
            </div>

            {/* Show different information based on operation type */}
            {operationType === EXPANSION_OPERATIONS.RENEW_TIMELOCK &&
              originalDelegation && (
                <div className="flex items-center gap-2">
                  <Text variant="body2" className="text-accent-secondary">
                    Timelock:
                  </Text>
                  <Text variant="body2" className="text-accent-primary">
                    {originalDelegation.stakingTimelock.toLocaleString()} blocks
                    → {delegation.stakingTimelock.toLocaleString()} blocks
                  </Text>
                </div>
              )}

            {operationType === EXPANSION_OPERATIONS.ADD_BSN_FP && (
              <>
                {newCount > 0 && (
                  <div className="flex items-center gap-2">
                    <Text variant="body2" className="text-accent-secondary">
                      New BSN/FP pairs:
                    </Text>
                    <Text variant="body2" className="text-accent-primary">
                      {newCount}
                    </Text>
                  </div>
                )}
                {originalDelegation &&
                  originalDelegation.stakingTimelock !==
                    delegation.stakingTimelock && (
                    <div className="flex items-center gap-2">
                      <Text variant="body2" className="text-accent-secondary">
                        Timelock renewed to:
                      </Text>
                      <Text variant="body2" className="text-accent-primary">
                        {delegation.stakingTimelock.toLocaleString()} blocks
                      </Text>
                    </div>
                  )}
              </>
            )}
          </div>

          {/* Show BSN/FP pairs - different display for different operation types */}
          <div className="mt-3 space-y-1">
            <Text variant="body2" className="text-accent-secondary mb-1">
              BSN / Finality Provider pairs:
            </Text>
            <div className="space-y-1">
              {bsnFpPairs.map((pair, index) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                  <Text
                    variant="body2"
                    className={
                      pair.isNew ? "text-primary-light" : "text-accent-primary"
                    }
                  >
                    {pair.bsnName} / {pair.fpName}
                  </Text>
                  {/* Only show NEW labels for ADD_BSN_FP operations and actually new pairs */}
                  {operationType === EXPANSION_OPERATIONS.ADD_BSN_FP &&
                    pair.isNew && (
                      <span className="text-xs bg-primary-light/10 text-primary-light px-2 py-0.5 rounded">
                        NEW
                      </span>
                    )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <Button
          variant="contained"
          size="small"
          onClick={onExpand}
          disabled={processing}
          className="ml-4"
        >
          Expand
        </Button>
      </div>
    </div>
  );
}

function VerifiedStakeExpansionModalInner({
  open,
  onClose,
  processing = false,
}: VerifiedStakeExpansionModalProps) {
  const { verifiedExpansions, resumeVerifiedExpansion } =
    useVerifiedStakingExpansionService();

  // Simple state for tracking expansion process
  const [isExpanding, setIsExpanding] = useState(false);

  const handleExpand = async (delegation: DelegationV2) => {
    setIsExpanding(true);
    try {
      await resumeVerifiedExpansion(delegation);
    } finally {
      setIsExpanding(false);
    }
  };

  return (
    <ResponsiveDialog open={open} onClose={() => !isExpanding && onClose()}>
      <DialogHeader
        title="Verified Stake Expansions"
        onClose={onClose}
        className="text-accent-primary"
      />
      <Text variant="body1" className="text-accent-secondary mb-4">
        Your expansion requests have been verified by the Babylon network. You
        can now complete the expansion by signing and broadcasting to Bitcoin.
      </Text>
      <DialogBody className="flex flex-col text-accent-primary gap-4 max-h-[70vh] pb-4 overflow-y-auto no-scrollbar">
        <div className="flex flex-col gap-2">
          {verifiedExpansions.length === 0 ? (
            <div className="text-center py-8">
              <Text variant="body1" className="text-accent-secondary">
                No verified expansions found.
              </Text>
            </div>
          ) : (
            <div className="space-y-3">
              {verifiedExpansions.map((delegation) => (
                <VerifiedExpansionItem
                  key={delegation.stakingTxHashHex}
                  delegation={delegation}
                  onExpand={() => handleExpand(delegation)}
                  processing={processing || isExpanding}
                />
              ))}
            </div>
          )}
        </div>
      </DialogBody>
      <DialogFooter className="flex gap-4">
        <Button
          variant="contained"
          className="flex-1 text-xs sm:text-base"
          onClick={onClose}
          disabled={processing || isExpanding}
        >
          Close
        </Button>
      </DialogFooter>
    </ResponsiveDialog>
  );
}

export function VerifiedStakeExpansionModal(
  props: VerifiedStakeExpansionModalProps,
) {
  return <VerifiedStakeExpansionModalInner {...props} />;
}
