import { Heading, Text } from "@babylonlabs-io/bbn-core-ui";
import { PropsWithChildren, useEffect, useState } from "react";

import { shouldDisplayTestingMsg } from "@/config";

import { LoadingSmall } from "../Loading/Loading";

import { ConfirmationModal } from "./ConfirmationModal";

interface ConfirmationModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: () => void;
  receivingValue: string;
  address: string;
  getTransactionFee: () => Promise<number>;
}

const bbnTokenName = shouldDisplayTestingMsg() ? "tBABY" : "BABY";

export const ClaimRewardModal = ({
  open,
  onClose,
  onSubmit,
  receivingValue,
  address,
  getTransactionFee,
}: PropsWithChildren<ConfirmationModalProps>) => {
  const [transactionFee, setTransactionFee] = useState<number>(0);

  useEffect(() => {
    const fetchTransactionFee = async () => {
      const fee = await getTransactionFee();
      setTransactionFee(fee);
    };
    fetchTransactionFee();
  }, [getTransactionFee]);

  return (
    <ConfirmationModal
      open={open}
      processing={false}
      title="Claim tBABY"
      onClose={onClose}
      onSubmit={onSubmit}
    >
      <div className="flex flex-col mt-8 gap-10">
        <div className="flex flex-col gap-4 divide-y divide-inherit">
          <div className="flex flex-row items-center justify-between">
            <Text variant="body1" className="text-center">
              Receiving
            </Text>
            <Text variant="body1">
              {receivingValue} {bbnTokenName}
            </Text>
          </div>

          <div className="flex flex-row items-center justify-between pt-4">
            <Text variant="body1">
              Babylon {shouldDisplayTestingMsg() ? "Test" : ""} Chain Address
            </Text>
            <Text variant="body1">{address}</Text>
          </div>
          <div className="flex flex-row items-center justify-between pt-4">
            <Text variant="body1">Transaction Fees</Text>
            {transactionFee === 0 ? (
              <LoadingSmall />
            ) : (
              <Text variant="body1">
                {transactionFee} {bbnTokenName}
              </Text>
            )}
          </div>
        </div>
        <div className="flex flex-col gap-4 mb-10">
          <Heading variant="h6">Attention!</Heading>
          <Text variant="body2">
            Processing your claim will take approximately 2 blocks to complete.
          </Text>
          {shouldDisplayTestingMsg() && (
            <Text variant="body2">
              {bbnTokenName} is a test token without any real world value.
            </Text>
          )}
        </div>
      </div>
    </ConfirmationModal>
  );
};
