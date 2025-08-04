import {
  Button,
  DialogBody,
  DialogFooter,
  DialogHeader,
  Text,
} from "@babylonlabs-io/core-ui";

import { ResponsiveDialog } from "@/ui/common/components/Modals/ResponsiveDialog";
import { useExpansionHistoryModalData } from "@/ui/common/hooks/useExpansionHistoryModalData";
import {
  DelegationV2,
  DelegationWithFP,
} from "@/ui/common/types/delegationsV2";

import { ActivityCard } from "../ActivityCard/ActivityCard";

interface ExpansionHistoryModalProps {
  open: boolean;
  onClose: () => void;
  targetDelegation: DelegationWithFP | null;
  allDelegations: DelegationV2[];
}

export function ExpansionHistoryModal({
  open,
  onClose,
  targetDelegation,
  allDelegations,
}: ExpansionHistoryModalProps) {
  const { expansionChain, activityCards, hasExpansionHistory } =
    useExpansionHistoryModalData({
      targetDelegation,
      allDelegations,
    });

  if (!targetDelegation) return null;

  return (
    <ResponsiveDialog open={open} onClose={onClose}>
      <DialogHeader
        title="Expansion History"
        onClose={onClose}
        className="text-accent-primary"
      />
      <DialogBody className="flex flex-col pb-4 pt-4 text-accent-primary gap-4 max-h-[70vh] overflow-y-auto">
        <div className="flex flex-col gap-2">
          {!hasExpansionHistory ? (
            <div className="text-center py-8">
              <Text variant="body1" className="text-accent-secondary">
                No expansion history found
              </Text>
            </div>
          ) : (
            <div className="space-y-3">
              {activityCards.map((cardData, index) => (
                <ActivityCard
                  key={expansionChain[index]?.stakingTxHashHex || index}
                  data={cardData}
                  className="border border-secondary-strokeLight"
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
        >
          Close
        </Button>
      </DialogFooter>
    </ResponsiveDialog>
  );
}
