import {
  Button,
  DialogBody,
  DialogFooter,
  DialogHeader,
} from "@babylonlabs-io/core-ui";
import { useState } from "react";

import { ResponsiveDialog } from "@/ui/components/Modals/ResponsiveDialog";
import { FinalityProviders } from "@/ui/components/Multistaking/FinalityProviderField/FinalityProviders";

interface Props {
  open: boolean;
  defaultFinalityProvider: string;
  onClose: () => void;
  onAdd: (selectedProviderKey: string) => void;
  onBack?: () => void;
}

export const FinalityProviderModal = ({
  defaultFinalityProvider,
  open,
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
        title="Select Babylon Genesis Finality Provider"
        onClose={handleClose}
        className="text-accent-primary"
      />

      <DialogBody className="flex flex-col mb-4 mt-4 text-accent-primary">
        <div>
          Finality Providers play a key role in securing Proof-of-Stake networks
          by validating and finalising transactions. Select one to delegate your
          stake and earn rewards.
        </div>
        <div className="overflow-x-auto flex flex-col gap-2 mt-10">
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
            onAdd(selectedFP);
            handleClose();
          }}
          disabled={!selectedFP}
        >
          Add
        </Button>
      </DialogFooter>
    </ResponsiveDialog>
  );
};
