import { Heading, Text } from "@babylonlabs-io/bbn-core-ui";
import { PropsWithChildren } from "react";

import { shouldDisplayTestingMsg } from "@/config";
import { getNetworkConfigBBN } from "@/config/network/bbn";
import { ubbnToBaby } from "@/utils/bbn";
import { trim } from "@/utils/trim";

import { LoadingSmall } from "../Loading/Loading";

import { ConfirmationModal } from "./ConfirmationModal";

interface ConfirmationModalProps {
  processing: boolean;
  open: boolean;
  address: string;
  receivingValue: string;
  transactionFee: number;
  onClose: () => void;
  onSubmit: () => void;
}

const { coinSymbol } = getNetworkConfigBBN();

export const ClaimRewardModal = ({
  open,
  processing,
  receivingValue,
  address,
  transactionFee,
  onClose,
  onSubmit,
}: PropsWithChildren<ConfirmationModalProps>) => {
  return (
    <ConfirmationModal
      className="w-[660px] max-w-full"
      open={open}
      processing={processing}
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
              {receivingValue} {coinSymbol}
            </Text>
          </div>

          <div className="flex flex-row items-center justify-between pt-4">
            <Text variant="body1">
              Babylon {shouldDisplayTestingMsg() ? "Test" : ""} Chain Address
            </Text>
            <Text variant="body1">{trim(address, 14)}</Text>
          </div>
          <div className="flex flex-row items-center justify-between pt-4">
            <Text variant="body1">Transaction Fees</Text>
            {transactionFee === 0 ? (
              <LoadingSmall />
            ) : (
              <Text variant="body1">
                {ubbnToBaby(transactionFee)} {coinSymbol}
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
              {coinSymbol} is a test token without any real world value.
            </Text>
          )}
        </div>
      </div>
    </ConfirmationModal>
  );
};
