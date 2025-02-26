import {
  Button,
  DialogBody,
  DialogFooter,
  DialogHeader,
  Heading,
  Loader,
  Radio,
  Text,
} from "@babylonlabs-io/core-ui";
import { useEffect, useRef, useState } from "react";

import { ResponsiveDialog } from "@/app/components/Modals/ResponsiveDialog";
import { StatusView } from "@/app/components/Staking/FinalityProviders/FinalityProviderTableStatusView";
import { useNetworkFees } from "@/app/hooks/client/api/useNetworkFees";
import { useStakingState } from "@/app/state/StakingState";

import { CustomLabel } from "./components/CustomLabel";
import { Label } from "./components/Label";

interface FeeModalProps {
  open?: boolean;
  onSubmit?: (value: number) => void;
  onClose?: () => void;
}

export function FeeModal({ open, onSubmit, onClose }: FeeModalProps) {
  const [selectedValue, setSelectedValue] = useState("");
  const [customFee, setCustomFee] = useState("");
  const customFeeRef = useRef<HTMLInputElement>(null);

  const {
    data: {
      fastestFee = 0,
      halfHourFee: mediumFee = 0,
      hourFee: lowestFee = 0,
    } = {},
    isLoading,
  } = useNetworkFees();
  const { stakingInfo: { defaultFeeRate = 0 } = {} } = useStakingState();

  useEffect(() => {
    if (selectedValue === "custom") {
      customFeeRef.current?.focus();
    }
  }, [selectedValue]);

  const feeOptions = [
    {
      label: (
        <Label
          label="Fast"
          amount={fastestFee.toString()}
          hint="Next Block"
          warning={fastestFee < defaultFeeRate}
        />
      ),
      className: "border border-secondary-strokeLight rounded p-4",
      key: "fast",
      value: fastestFee.toString(),
    },
    {
      label: (
        <Label
          label="Medium"
          amount={mediumFee.toString()}
          hint="Estimated 30mins"
          warning={mediumFee < defaultFeeRate}
        />
      ),
      className: "border border-secondary-strokeLight rounded p-4",
      key: "medium",
      value: mediumFee.toString(),
    },
    {
      label: (
        <Label
          label="Slow"
          amount={lowestFee.toString()}
          hint="Estimated 60mins"
          warning={lowestFee < defaultFeeRate}
        />
      ),
      className: "border border-secondary-strokeLight rounded p-4",
      key: "slow",
      value: lowestFee.toString(),
    },
    {
      label: (
        <CustomLabel
          ref={customFeeRef}
          label="Custom"
          amount={customFee}
          disabled={selectedValue !== "custom"}
          warning={parseFloat(customFee) < defaultFeeRate}
          onChange={(e) => void setCustomFee(e.currentTarget?.value)}
        />
      ),
      className: "items-center border border-transparent px-4 py-2",
      key: "custom",
      value: customFee,
    },
  ];

  function handleSubmit() {
    const selectedOption = feeOptions.find(
      (option) => option.key === selectedValue,
    );

    if (selectedOption && selectedOption.value) {
      onSubmit?.(parseFloat(selectedOption.value));
      onClose?.();
    }
  }

  return (
    <ResponsiveDialog
      open={open}
      className="text-accent-primary"
      onClose={onClose}
    >
      <DialogHeader title="Advanced Fee Settings" onClose={onClose}>
        <Text variant="body1" className="mt-2 text-accent-secondary">
          Adjusting the fee rate lets you control how quickly your Bitcoin
          transaction is confirmed, with higher fees resulting in faster
          confirmations and lower fees potentially causing delays.
        </Text>
      </DialogHeader>

      <DialogBody className="mt-6 md:min-h-96 flex flex-col gap-6">
        {isLoading ? (
          <StatusView
            className="flex-1 h-auto"
            icon={<Loader className="text-accent-primary" />}
            title="Please wait..."
          />
        ) : (
          <>
            <Heading variant="h6">Fee Rate</Heading>

            {feeOptions.map((option) => (
              <Radio
                key={option.key}
                labelClassName={option.className}
                label={option.label}
                checked={selectedValue === option.key}
                value={option.key}
                onChange={() => void setSelectedValue(option.key)}
              />
            ))}
          </>
        )}
      </DialogBody>

      <DialogFooter className="mt-10">
        <Button
          disabled={isLoading || !selectedValue}
          fluid
          onClick={handleSubmit}
        >
          Apply
        </Button>
      </DialogFooter>
    </ResponsiveDialog>
  );
}
