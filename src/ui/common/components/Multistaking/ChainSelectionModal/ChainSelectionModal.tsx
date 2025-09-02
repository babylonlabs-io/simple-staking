import {
  Button,
  DialogBody,
  DialogFooter,
  DialogHeader,
  SubSection,
} from "@babylonlabs-io/core-ui";
import { useMemo } from "react";
import { MdOutlineInfo } from "react-icons/md";

import { ResponsiveDialog } from "@/ui/common/components/Modals/ResponsiveDialog";
import { getNetworkConfigBBN } from "@/ui/common/config/network/bbn";
import { useFinalityProviderState } from "@/ui/common/state/FinalityProviderState";
import { Bsn } from "@/ui/common/types/bsn";

import { ChainButton } from "./shared/ChainButton";

const { chainId: BSN_ID } = getNetworkConfigBBN();

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
  activeBsnId,
  selectedBsns = {},
  onSelect,
  onNext,
  onClose,
  onRemove,
}: ChainSelectionModalProps) => {
  const { finalityProviderMap } = useFinalityProviderState();
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

  console.log({ selectedBsns });

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
              bsnId={babylonBsn.id}
              logoUrl={babylonBsn.logoUrl}
              title={babylonBsn.name}
              bsnName={babylonBsn.name}
              provider={
                selectedBsns[babylonBsn.id]
                  ? finalityProviderMap.get(selectedBsns[babylonBsn.id])
                  : undefined
              }
              disabled={Boolean(selectedBsns[babylonBsn.id])}
              isExisting={Boolean(selectedBsns[babylonBsn.id])}
              onSelectFp={() => {
                onSelect(babylonBsn.id);
                onNext();
              }}
              onRemove={(id) => onRemove(id)}
            />
          )}
          {externalBsns.map((bsn) => (
            <ChainButton
              key={bsn.id}
              bsnId={bsn.id}
              logoUrl={bsn.logoUrl}
              title={bsn.name}
              bsnName={bsn.name}
              provider={
                selectedBsns[bsn.id]
                  ? finalityProviderMap.get(selectedBsns[bsn.id])
                  : undefined
              }
              disabled={Boolean(selectedBsns[bsn.id]) || !isBabylonSelected}
              isExisting={Boolean(selectedBsns[bsn.id])}
              onSelectFp={() => {
                onSelect(bsn.id);
                onNext();
              }}
              onRemove={(id) => onRemove(id)}
            />
          ))}
        </div>
        {!isBabylonSelected && (
          <SubSection className="text-base text-[#387085] gap-3 flex-row mt-4 rounded">
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
          onClick={onClose}
          disabled={activeBsnId === undefined || !isBabylonSelected}
        >
          Add
        </Button>
      </DialogFooter>
    </ResponsiveDialog>
  );
};
