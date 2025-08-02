import {
  Button,
  DialogBody,
  DialogFooter,
  DialogHeader,
} from "@babylonlabs-io/core-ui";
import { useState } from "react";

import { ResponsiveDialog } from "@/ui/common/components/Modals/ResponsiveDialog";
import { FinalityProviders } from "@/ui/common/components/Multistaking/FinalityProviderField/FinalityProviders";

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

  const handleClose = () => {
    onClose();
    setSelectedFp("");
  };

  return (
    <ResponsiveDialog open={open} onClose={handleClose} className="w-[52rem]">
      <DialogHeader
        title="Select Finality Provider"
        onClose={handleClose}
        className="text-accent-primary"
      />

      <DialogBody className="flex flex-col mb-4 mt-4 text-accent-primary">
        <div>
          Finality Providers play a key role in securing Proof-of-Stake networks
          by validating and finalising transactions. Select one to delegate your
          stake.
        </div>
        <div
          className="overflow-x-auto flex flex-col gap-2 mt-10"
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
