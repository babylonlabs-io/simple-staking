import {
  Avatar,
  Button,
  DialogBody,
  DialogFooter,
  DialogHeader,
  Heading,
  Loader,
  Text,
} from "@babylonlabs-io/core-ui";
import { Fragment } from "react";

import { getNetworkConfigBBN } from "@/ui/common/config/network/bbn";
import { getNetworkConfigBTC } from "@/ui/common/config/network/btc";
import { useNetworkInfo } from "@/ui/common/hooks/client/api/useNetworkInfo";
import { usePrice } from "@/ui/common/hooks/client/api/usePrices";
import { useIsMobileView } from "@/ui/common/hooks/useBreakpoint";
import { satoshiToBtc } from "@/ui/common/utils/btc";
import { calculateTokenValueInCurrency } from "@/ui/common/utils/formatCurrency";
import { maxDecimals } from "@/ui/common/utils/maxDecimals";
import { blocksToDisplayTime } from "@/ui/common/utils/time";

import { ResponsiveDialog } from "./ResponsiveDialog";

interface PreviewModalProps {
  open: boolean;
  onClose: () => void;
  onSign: () => void;
  finalityProvider: string | undefined;
  finalityProviderAvatar: string | undefined;
  stakingAmountSat: number;
  stakingTimelock: number;
  stakingFeeSat: number;
  feeRate: number;
  unbondingFeeSat: number;
  processing: boolean;
}

const { networkFullName: bbnNetworkFullName } = getNetworkConfigBBN();
const { coinSymbol, networkName, displayUSD } = getNetworkConfigBTC();

export const PreviewModal = ({
  open,
  onClose,
  finalityProvider,
  finalityProviderAvatar,
  stakingAmountSat,
  stakingTimelock,
  onSign,
  stakingFeeSat,
  feeRate,
  unbondingFeeSat,
  processing,
}: PreviewModalProps) => {
  const isMobileView = useIsMobileView();

  const { data: networkInfo } = useNetworkInfo();
  const confirmationDepth =
    networkInfo?.params.btcEpochCheckParams?.latestParam
      ?.btcConfirmationDepth || 30;
  const unbondingTime =
    blocksToDisplayTime(
      networkInfo?.params.bbnStakingParams?.latestParam?.unbondingTime,
    ) || "7 days";

  const btcInUsd = usePrice(coinSymbol);

  const FinalityProviderValue = isMobileView ? (
    <span className="flex gap-2">
      {finalityProviderAvatar && (
        <Avatar
          size="small"
          url={finalityProviderAvatar}
          variant="circular"
          alt={finalityProvider || "-"}
        />
      )}
      <Text variant="body1">{finalityProvider || "-"}</Text>
    </span>
  ) : (
    <Text variant="body1">{finalityProvider || "-"}</Text>
  );

  const previewFields = [
    {
      key: "Finality Provider",
      value: FinalityProviderValue,
    },
    {
      key: "Stake Amount",
      value: (
        <>
          <Text variant="body1">
            {maxDecimals(satoshiToBtc(stakingAmountSat), 8)} {coinSymbol}
          </Text>
          {displayUSD && (
            <Text
              as="span"
              variant="body2"
              className="text-accent-secondary ml-2"
            >
              {calculateTokenValueInCurrency(
                satoshiToBtc(stakingAmountSat),
                btcInUsd,
              )}
            </Text>
          )}
        </>
      ),
    },
    {
      key: "Fee rate",
      value: <Text variant="body1">{feeRate} sat/vB</Text>,
    },
    {
      key: "Transaction fee",
      value: (
        <>
          <Text variant="body1">
            {maxDecimals(satoshiToBtc(stakingFeeSat), 8)} {coinSymbol}
          </Text>
          {displayUSD && (
            <Text
              as="span"
              variant="body2"
              className="text-accent-secondary ml-2"
            >
              {calculateTokenValueInCurrency(
                satoshiToBtc(stakingFeeSat),
                btcInUsd,
              )}
            </Text>
          )}
        </>
      ),
    },
    {
      key: "Term",
      value: (
        <>
          <Text variant="body1">{stakingTimelock} blocks</Text>
          <Text variant="body2" className="text-accent-secondary">
            ~ {blocksToDisplayTime(stakingTimelock)}
          </Text>
        </>
      ),
    },
    {
      key: "On Demand Unbonding",
      value: (
        <Text variant="body1">Enabled (~ {unbondingTime} unbonding time)</Text>
      ),
    },
    {
      key: "Unbonding fee",
      value: (
        <>
          <Text variant="body1">
            {maxDecimals(satoshiToBtc(unbondingFeeSat), 8)} {coinSymbol}
          </Text>
          {displayUSD && (
            <Text
              as="span"
              variant="body2"
              className="text-accent-secondary ml-2"
            >
              {calculateTokenValueInCurrency(
                satoshiToBtc(unbondingFeeSat),
                btcInUsd,
              )}
            </Text>
          )}
        </>
      ),
    },
  ];

  return (
    <ResponsiveDialog open={open} onClose={onClose}>
      <DialogHeader
        title="Preview"
        onClose={onClose}
        className="text-accent-primary"
      />

      <DialogBody className="flex flex-col mb-8 mt-4 text-accent-primary gap-4">
        <div className="flex flex-col">
          {previewFields.map((field, index) => (
            <Fragment key={field.key}>
              <div key={field.key} className="flex justify-between">
                <Text variant="body1">{field.key}</Text>
                <div className="text-right">{field.value}</div>
              </div>
              {index < previewFields.length - 1 && (
                <div className="divider mx-0 my-2" />
              )}
            </Fragment>
          ))}
        </div>
        <br />
        <div className="flex flex-col gap-2">
          <Heading variant="h6">Attention!</Heading>
          <Text variant="body2">
            1. No third party possesses your staked {coinSymbol}. You are the
            only one who can unbond and withdraw your stake.
          </Text>
          <Text variant="body2">
            2. Your stake will first be sent to {bbnNetworkFullName} for
            verification (~20 seconds), then you will be prompted to submit it
            to the {networkName} ledger. It will be marked as
            &quot;Pending&quot; until it receives {confirmationDepth} Bitcoin
            confirmations.
          </Text>
        </div>
      </DialogBody>

      <DialogFooter className="flex gap-4">
        <Button
          variant="outlined"
          color="primary"
          onClick={onClose}
          className="flex-1"
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={onSign}
          className="flex-1"
          disabled={processing}
        >
          {processing ? (
            <Loader size={16} className="text-white" />
          ) : (
            <>
              Proceed <span className="hidden md:inline">to Signing</span>
            </>
          )}
        </Button>
      </DialogFooter>
    </ResponsiveDialog>
  );
};
