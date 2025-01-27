import {
  Button,
  Chip,
  DialogBody,
  DialogFooter,
  DialogHeader,
  Heading,
  Input,
  Loader,
  Radio,
  Text,
} from "@babylonlabs-io/bbn-core-ui";
import { useEffect, useRef, useState } from "react";

import { ResponsiveDialog } from "@/app/components/Modals/ResponsiveDialog";
import { StatusView } from "@/app/components/Staking/FinalityProviders/FinalityProviderTableStatusView";
import { useNetworkFees } from "@/app/hooks/client/api/useNetworkFees";

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

  useEffect(() => {
    if (selectedValue === "custom") {
      customFeeRef.current?.focus();
    }
  }, [selectedValue]);

  const renderLabel = (label: string, amount: number, hint: string) => {
    return (
      <Text
        as="span"
        className="flex flex-1 justify-between items-center"
        variant="body1"
      >
        <span>
          <b className="capitalize">{label}</b> ({amount} sat/vB)
        </span>

        <Chip>{hint}</Chip>
      </Text>
    );
  };

  const renderCustomLabel = (label: string, amount: number) => {
    return (
      <Text
        as="span"
        className="flex items-center gap-4 [&>.bbn-input]:h-10"
        variant="body1"
      >
        <b>Custom</b>{" "}
        <Input
          ref={customFeeRef}
          type="number"
          value={amount}
          disabled={selectedValue !== label}
          suffix={
            <Text className="whitespace-nowrap text-primary">sats vB</Text>
          }
          onChange={(e) => void setCustomFee(e.currentTarget?.value)}
        />
      </Text>
    );
  };

  const feeOptions = [
    {
      labelRenderer: renderLabel,
      className: "border border-primary-light/20 rounded p-4",
      key: "fast",
      value: fastestFee,
      hint: "Next Block",
    },
    {
      labelRenderer: renderLabel,
      className: "border border-primary-light/20 rounded p-4",
      key: "medium",
      value: mediumFee,
      hint: "Estimated 30mins",
    },
    {
      labelRenderer: renderLabel,
      className: "border border-primary-light/20 rounded p-4",
      key: "slow",
      value: lowestFee,
      hint: "Estimated 60mins",
    },
    {
      labelRenderer: renderCustomLabel,
      className: "items-center border border-transparent p-2",
      key: "custom",
      value: parseFloat(customFee),
      hint: "Next Block",
    },
  ];

  function handleSubmit() {
    const selectedOption = feeOptions.find(
      (option) => option.key === selectedValue,
    );

    if (selectedOption && !Number.isNaN(selectedOption.value)) {
      onSubmit?.(selectedOption.value);
      onClose?.();
    }
  }

  return (
    <ResponsiveDialog
      open={open}
      className="w-[41.25rem] max-w-full text-primary-dark"
      onClose={onClose}
    >
      <DialogHeader title="Advanced Fee Settings" onClose={onClose}>
        <Text variant="body1" className="mt-2 text-primary-light">
          Adjusting the fee rate lets you control how quickly your Bitcoin
          transaction is confirmed, with higher fees resulting in faster
          confirmations and lower fees potentially causing delays.
        </Text>
      </DialogHeader>

      <DialogBody className="mt-6 min-h-96 flex flex-col gap-6">
        {isLoading ? (
          <StatusView
            className="flex-1 h-auto"
            icon={<Loader />}
            title="Please wait..."
          />
        ) : (
          <>
            <Heading variant="h6">Fee Rate</Heading>

            {feeOptions.map((option) => (
              <Radio
                key={option.key}
                labelClassName={option.className}
                label={option.labelRenderer(
                  option.key,
                  option.value,
                  option.hint,
                )}
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
