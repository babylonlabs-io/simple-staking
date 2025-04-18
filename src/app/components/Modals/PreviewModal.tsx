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

import { useLanguage } from "@/app/contexts/LanguageContext";
import { useNetworkInfo } from "@/app/hooks/client/api/useNetworkInfo";
import { usePrice } from "@/app/hooks/client/api/usePrices";
import { useIsMobileView } from "@/app/hooks/useBreakpoint";
import { translations } from "@/app/translations";
import { getNetworkConfigBBN } from "@/config/network/bbn";
import { getNetworkConfigBTC } from "@/config/network/btc";
import { satoshiToBtc } from "@/utils/btc";
import { calculateTokenValueInCurrency } from "@/utils/formatCurrency";
import { maxDecimals } from "@/utils/maxDecimals";
import { blocksToDisplayTime } from "@/utils/time";

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
  const { coinSymbol, networkName } = getNetworkConfigBTC();
  const { language } = useLanguage();
  const t = translations[language];

  const { data: networkInfo } = useNetworkInfo();
  const confirmationDepth =
    networkInfo?.params.btcEpochCheckParams?.latestParam
      ?.btcConfirmationDepth || 10;
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
      key: t.finalityProvider,
      value: FinalityProviderValue,
    },
    {
      key: t.stakeAmount,
      value: (
        <>
          <Text variant="body1">
            {maxDecimals(satoshiToBtc(stakingAmountSat), 8)} {coinSymbol}
          </Text>
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
        </>
      ),
    },
    {
      key: t.commission,
      value: <Text variant="body1">{feeRate} sat/vB</Text>,
    },
    {
      key: t.transactionFee,
      value: (
        <>
          <Text variant="body1">
            {maxDecimals(satoshiToBtc(stakingFeeSat), 8)} {coinSymbol}
          </Text>
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
        </>
      ),
    },
    {
      key: t.term,
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
      key: t.onDemandUnbonding,
      value: (
        <Text variant="body1">Enabled (~ {unbondingTime} unbonding time)</Text>
      ),
    },
    {
      key: t.unbondingFee,
      value: (
        <>
          <Text variant="body1">
            {maxDecimals(satoshiToBtc(unbondingFeeSat), 8)} {coinSymbol}
          </Text>
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
        </>
      ),
    },
  ];

  return (
    <ResponsiveDialog open={open} onClose={onClose}>
      <DialogHeader
        title={t.preview}
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
          <Heading variant="h6">{t.attention}</Heading>
          <Text variant="body2">
            {t.previewAttention1.replace("{coinSymbol}", coinSymbol)}
          </Text>
          <Text variant="body2">
            {t.previewAttention2
              .replace("{bbnNetworkFullName}", bbnNetworkFullName)
              .replace("{networkName}", networkName)
              .replace("{confirmationDepth}", confirmationDepth.toString())}
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
          {t.cancel}
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
            <>{t.proceedToSigning}</>
          )}
        </Button>
      </DialogFooter>
    </ResponsiveDialog>
  );
};
