import {
  Button,
  DialogBody,
  DialogFooter,
  DialogHeader,
  Text,
} from "@babylonlabs-io/core-ui";
import { PropsWithChildren, useEffect, useState } from "react";

import babylon from "@/infrastructure/babylon";
import { ResponsiveDialog } from "@/ui/common/components/Modals/ResponsiveDialog";
import { getNetworkConfigBBN } from "@/ui/common/config/network/bbn";
import { useCosmosWallet } from "@/ui/common/context/wallet/CosmosWalletProvider";
import { usePrice } from "@/ui/common/hooks/client/api/usePrices";
import { useBbnTransaction } from "@/ui/common/hooks/client/rpc/mutation/useBbnTransaction";
import { ubbnToBaby } from "@/ui/common/utils/bbn";
import { calculateTokenValueInCurrency } from "@/ui/common/utils/formatCurrency";
import { maxDecimals } from "@/ui/common/utils/maxDecimals";

const { coinSymbol, displayUSD } = getNetworkConfigBBN();

interface PreviewModalProps {
  open: boolean;
  processing?: boolean;
  title: string;
  onClose: () => void;
  onProceed: () => void;
  rewards: Array<{ validatorAddress: string }>;
  totalReward: bigint;
}

export const RewardsPreviewModal = ({
  open,
  processing = false,
  title,
  onClose,
  onProceed,
  rewards,
  totalReward,
}: PropsWithChildren<PreviewModalProps>) => {
  const { bech32Address } = useCosmosWallet();
  const { estimateBbnGasFee } = useBbnTransaction();
  const babyPrice = usePrice(coinSymbol);
  const [feeAmount, setFeeAmount] = useState<number>(0);
  const [feeLoading, setFeeLoading] = useState<boolean>(false);

  // Estimate fee when modal opens
  useEffect(() => {
    const estimateFee = async () => {
      if (!open || !bech32Address || !rewards.length) return;

      setFeeLoading(true);
      try {
        const msgs = rewards.map((reward) =>
          babylon.txs.baby.createClaimRewardMsg({
            validatorAddress: reward.validatorAddress,
            delegatorAddress: bech32Address,
          }),
        );
        const gasFee = await estimateBbnGasFee(msgs);
        const totalFee = gasFee.amount.reduce(
          (acc, coin) => acc + Number(coin.amount),
          0,
        );
        setFeeAmount(totalFee);
      } catch (error) {
        console.error("Error estimating fee:", error);
        setFeeAmount(0);
      } finally {
        setFeeLoading(false);
      }
    };

    estimateFee();
  }, [open, bech32Address, rewards, estimateBbnGasFee]);

  const feeInBaby = ubbnToBaby(feeAmount);
  const feeInUsd = displayUSD
    ? calculateTokenValueInCurrency(feeInBaby, babyPrice)
    : undefined;

  const rewardInBaby = ubbnToBaby(Number(totalReward));
  const rewardInUsd = displayUSD
    ? calculateTokenValueInCurrency(rewardInBaby, babyPrice)
    : undefined;
  return (
    <ResponsiveDialog open={open} onClose={onClose}>
      <DialogHeader title={title} className="text-accent-primary" />

      <DialogBody className="no-scrollbar mb-[40px] mt-8 flex max-h-[calc(100vh-12rem)] flex-col gap-[40px] overflow-y-auto text-accent-primary">
        <div className="flex flex-col gap-4">
          <Text variant="body1" className="flex justify-between">
            <span>Babylon Genesis</span>
            <span className="flex flex-col items-end">
              {maxDecimals(rewardInBaby, 6)} {coinSymbol}
              {rewardInUsd && <Text variant="body2">{rewardInUsd}</Text>}
            </span>
          </Text>

          <div className="border-divider w-full border-t" />

          <Text variant="body1" className="flex justify-between">
            <span>Transaction Fees</span>
            <span className="flex flex-col gap-2 items-end">
              {feeLoading ? (
                <Text variant="body2">Calculating...</Text>
              ) : (
                <>
                  {maxDecimals(feeInBaby, 6)} {coinSymbol}
                  {feeInUsd && <Text variant="body2">{feeInUsd}</Text>}
                </>
              )}
            </span>
          </Text>
        </div>
      </DialogBody>

      <DialogFooter className="flex flex-col gap-4 pt-0 sm:flex-row">
        <Button
          variant="contained"
          color="primary"
          onClick={onProceed}
          className="w-full sm:order-2 sm:flex-1"
          disabled={processing}
        >
          {processing ? "Processing..." : "Proceed"}
        </Button>
        <Button
          variant="outlined"
          color="primary"
          onClick={onClose}
          className="w-full sm:order-1 sm:flex-1"
        >
          Cancel
        </Button>
      </DialogFooter>
    </ResponsiveDialog>
  );
};
