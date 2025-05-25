import {
  Button,
  DialogBody,
  DialogFooter,
  DialogHeader,
  useWatch,
} from "@babylonlabs-io/core-ui";

import { FinalityProviders } from "@/app/components/Staking/FinalityProviders/FinalityProviders";

export const FinalityProviderModal = ({
  onClose,
  onAdd,
  onBack,
}: {
  onClose: () => void;
  onAdd: (selectedProviderKey: string) => void;
  onBack: () => void;
}) => {
  const selectedFinalityProvider = useWatch({
    name: "finalityProvider",
    defaultValue: "",
  });

  return (
    <>
      <DialogHeader
        title="Select Babylon Genesis Finality Provider"
        onClose={onClose}
        className="text-accent-primary"
      />

      <DialogBody className="flex flex-col mb-4 mt-4 text-accent-primary">
        <div>
          Finality Providers play a key role in securing Proof-of-Stake networks
          by validating and finalising transactions. Select one to delegate your
          stake and earn rewards.
        </div>
        <div
          className="overflow-x-auto"
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "8px",
            marginTop: "40px",
          }}
        >
          <FinalityProviders />
        </div>
      </DialogBody>

      <DialogFooter className="flex justify-between">
        <Button variant="outlined" onClick={onBack}>
          Back
        </Button>
        <Button
          variant="contained"
          onClick={() => onAdd(selectedFinalityProvider)}
          disabled={!selectedFinalityProvider}
        >
          Add
        </Button>
      </DialogFooter>
    </>
  );
};
