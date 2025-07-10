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

import { getNetworkConfigBBN } from "@/ui/legacy/config/network/bbn";
import { getNetworkConfigBTC } from "@/ui/legacy/config/network/btc";
import { useNetworkInfo } from "@/ui/legacy/hooks/client/api/useNetworkInfo";
import { usePrice } from "@/ui/legacy/hooks/client/api/usePrices";
import { useIsMobileView } from "@/ui/legacy/hooks/useBreakpoint";
import { satoshiToBtc } from "@/ui/legacy/utils/btc";
import { calculateTokenValueInCurrency } from "@/ui/legacy/utils/formatCurrency";
import { maxDecimals } from "@/ui/legacy/utils/maxDecimals";
import { blocksToDisplayTime } from "@/ui/legacy/utils/time";

import { ResponsiveDialog } from "./ResponsiveDialog";

interface ProviderInfo {
  name: string;
  avatar?: string;
}

interface PreviewMultistakingModalProps {
  open: boolean;
  onClose: () => void;
  onSign: () => void;
  providers: ProviderInfo[];
  stakingAmountSat: number;
  stakingTimelock: number;
  stakingFeeSat: number;
  feeRate: number;
  unbondingFeeSat: number;
  processing: boolean;
}

const { networkFullName: bbnNetworkFullName } = getNetworkConfigBBN();
const { coinSymbol, networkName, displayUSD } = getNetworkConfigBTC();

export const PreviewMultistakingModal = ({
  open,
  onClose,
  onSign,
  providers,
  stakingAmountSat,
  stakingTimelock,
  stakingFeeSat,
  feeRate,
  unbondingFeeSat,
  processing,
}: PreviewMultistakingModalProps) => {
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

  const FinalityProvidersValue = isMobileView ? (
    <div className="flex flex-col gap-2">
      {providers.map((p) => (
        <span key={p.name} className="flex gap-2 items-center">
          {p.avatar && (
            <Avatar
              size="small"
              url={p.avatar}
              variant="circular"
              alt={p.name}
            />
          )}
          <Text variant="body1">{p.name}</Text>
        </span>
      ))}
    </div>
  ) : (
    <Text variant="body1">
      {providers.map((p) => p.name).join(", ") || "-"}
    </Text>
  );

  const previewFields = [
    {
      key: "Finality Providers",
      value: FinalityProvidersValue,
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
