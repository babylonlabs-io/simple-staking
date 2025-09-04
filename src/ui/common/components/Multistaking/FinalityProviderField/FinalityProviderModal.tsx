import {
  Button,
  DialogBody,
  DialogFooter,
  DialogHeader,
} from "@babylonlabs-io/core-ui";
import { useMemo, useState } from "react";

import { getBsnConfig } from "@/ui/common/api/getBsn";
import { ResponsiveDialog } from "@/ui/common/components/Modals/ResponsiveDialog";
import { FinalityProviders } from "@/ui/common/components/Multistaking/FinalityProviderField/FinalityProviders";
import { useFinalityProviderBsnState } from "@/ui/common/state/FinalityProviderBsnState";

interface Props {
  open: boolean;
  defaultFinalityProvider?: string;
  selectedBsnId?: string;
  onClose: () => void;
  onAdd: (selectedBsnId: string, selectedProviderKey: string) => void;
  onBack?: () => void;
}

export const FinalityProviderModal = ({
  defaultFinalityProvider = "",
  open,
  selectedBsnId,
  onClose,
  onAdd,
  onBack,
}: Props) => {
  const [selectedFP, setSelectedFp] = useState(defaultFinalityProvider);
  const { selectedBsn } = useFinalityProviderBsnState();

  const bsnConfig = useMemo(() => getBsnConfig(selectedBsn), [selectedBsn]);

  const handleClose = () => {
    onClose();
    setSelectedFp("");
  };

  return (
    <ResponsiveDialog open={open} onClose={handleClose} className="w-[52rem]">
      <DialogHeader
        title={bsnConfig.modalTitle}
        onClose={handleClose}
        className="text-accent-primary"
      />

      <DialogBody className="flex flex-col mb-4 mt-4 text-accent-primary gap-4">
        <div className="text-accent-secondary">
          Finality Providers play a key role in securing Proof-of-Stake networks
          by validating and finalising transactions. Select one to delegate your
          stake.
        </div>

        <div
          className="overflow-x-auto flex flex-col gap-2"
          style={{ maxHeight: "min(60vh, 500px)" }}
        >
          <FinalityProviders selectedFP={selectedFP} onChange={setSelectedFp} />
        </div>
      </DialogBody>

      <DialogFooter className="flex justify-between">
        {onBack ? (
          <Button variant="outlined" onClick={onBack}>
            Back
          </Button>
        ) : (
          <div />
        )}
        <Button
          variant="contained"
          onClick={() => {
            if (selectedBsnId !== undefined) {
              onAdd(selectedBsnId, selectedFP);
              setSelectedFp("");
            }
          }}
          disabled={!selectedFP}
        >
          Add
        </Button>
      </DialogFooter>
    </ResponsiveDialog>
  );
};
