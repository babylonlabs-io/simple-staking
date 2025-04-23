import { Heading, Text } from "@babylonlabs-io/core-ui";
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
      className="max-w-full"
      open={open}
      processing={processing}
      title="Claim tBABY"
      onClose={onClose}
      onSubmit={onSubmit}
    >
      <div className="flex flex-col mt-8 gap-10">
        <div className="flex flex-col gap-4 divide-y divide-inherit">
          <div className="flex flex-row items-center justify-between">
            <Text
              variant="body1"
              className="text-center text-itemSecondaryDefault !font-normal"
            >
              Receiving
            </Text>
            <Text variant="body1">
              {receivingValue} {coinSymbol}
            </Text>
          </div>

          <div className="flex flex-row items-center justify-between pt-4">
            <Text
              variant="body1"
              className="text-itemSecondaryDefault !font-normal"
            >
              Babylon {shouldDisplayTestingMsg() ? "Test" : ""} Chain Address
            </Text>
            <Text variant="body1">{trim(address, 14)}</Text>
          </div>
          <div className="flex flex-row items-center justify-between pt-4">
            <Text
              variant="body1"
              className="text-itemSecondaryDefault !font-normal"
            >
              Transaction Fees
            </Text>
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
          <p className="font-semibold text-callout text-itemSecondaryDefault text-pretty">
            Processing your claim will take approximately{" "}
            <span className="text-itemPrimaryDefault">2 blocks</span> to
            complete.
          </p>

          {shouldDisplayTestingMsg() && (
            <p className="font-semibold text-callout text-itemSecondaryDefault text-pretty">
              {coinSymbol} is a test token without any real world value.
            </p>
          )}
        </div>
      </div>
    </ConfirmationModal>
  );
};
