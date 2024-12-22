import { Heading, Text } from "@babylonlabs-io/bbn-core-ui";
import { PropsWithChildren } from "react";

import { ConfirmationModal } from "./ConfirmationModal";

interface ConfirmationModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: () => void;
  receivingValue: string;
  address: string;
  transactionFee: string;
}

export const ClaimRewardModal = ({
  open,
  onClose,
  onSubmit,
  receivingValue,
  address,
  transactionFee,
}: PropsWithChildren<ConfirmationModalProps>) => {
  return (
    <ConfirmationModal
      open={open}
      processing={false}
      title="Claim tBABY Reward"
      onClose={onClose}
      onSubmit={onSubmit}
    >
      <div className="flex flex-col mt-8 gap-10">
        <div className="flex flex-col gap-4 divide-y divide-inherit">
          <div className="flex flex-row items-center justify-between">
            <Text variant="body1" className="text-center">
              Receiving
            </Text>
            <Text variant="body1">{receivingValue} tBABY</Text>
          </div>

          <div className="flex flex-row items-center justify-between pt-4">
            <Text variant="body1">Babylon Test ChainAddress</Text>
            <Text variant="body1">{address}</Text>
          </div>
          <div className="flex flex-row items-center justify-between pt-4">
            <Text variant="body1">Transaction Fees</Text>
            <Text variant="body1">{transactionFee} tBABY</Text>
          </div>
        </div>
        <div className="flex flex-col gap-4 mb-10">
          <Heading variant="h6">Attension!</Heading>
          <Text variant="body2">
            Processing your claim will take approximately 2 blocks to complete.
          </Text>
        </div>
      </div>
    </ConfirmationModal>
  );
};
