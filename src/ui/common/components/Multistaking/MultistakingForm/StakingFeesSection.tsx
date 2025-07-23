import {
  FeesSection as CoreFeesSection,
  useFormContext,
  useWatch,
} from "@babylonlabs-io/core-ui";
import { useEffect, useMemo, useState } from "react";

import { FeeModal } from "@/ui/common/components/Staking/FeeModal";
import { getNetworkConfigBBN } from "@/ui/common/config/network/bbn";
import { getNetworkConfigBTC } from "@/ui/common/config/network/btc";
import { BBN_FEE_AMOUNT } from "@/ui/common/constants";
import { usePrice } from "@/ui/common/hooks/client/api/usePrices";
import { useStakingService } from "@/ui/common/hooks/services/useStakingService";
import { useStakingState } from "@/ui/common/state/StakingState";
import { satoshiToBtc } from "@/ui/common/utils/btc";
import { calculateTokenValueInCurrency } from "@/ui/common/utils/formatCurrency";
import { maxDecimals } from "@/ui/common/utils/maxDecimals";

export function StakingFeesSection() {
  const { setValue, setError, clearErrors } = useFormContext();
  const feeRate = useWatch({ name: "feeRate" });
  const feeAmountSat = useWatch({ name: "feeAmount" });
  const amount = useWatch({ name: "amount" });
  const term = useWatch({ name: "term" });
  const finalityProviders = useWatch({ name: "finalityProviders" });

  const providerIdsJson = useMemo(
    () => JSON.stringify(Object.values(finalityProviders ?? {}).sort()),
    [finalityProviders],
  );

  const { calculateFeeAmount } = useStakingService();
  const { stakingInfo } = useStakingState();

  useEffect(() => {
    if (stakingInfo?.defaultFeeRate !== undefined) {
      setValue("feeRate", stakingInfo.defaultFeeRate.toString(), {
        shouldValidate: true,
        shouldDirty: true,
        shouldTouch: true,
      });
    }
  }, [stakingInfo?.defaultFeeRate, setValue]);

  useEffect(() => {
    let cancelled = false;

    const run = () => {
      try {
        const validProviders = providerIdsJson
          ? (JSON.parse(providerIdsJson) as string[])
          : [];

        if (!validProviders.length || !amount || !term || !feeRate) {
          if (!cancelled) {
            setValue("feeAmount", "0", {
              shouldValidate: false,
              shouldDirty: false,
              shouldTouch: false,
            });
          }
          return;
        }

        const feeAmount = calculateFeeAmount({
          finalityProviders: validProviders,
          amount: Number(amount),
          term: Number(term),
          feeRate: Number(feeRate),
        });

        if (!cancelled) {
          clearErrors("feeAmount");
          setValue("feeAmount", feeAmount.toString(), {
            shouldValidate: true,
            shouldDirty: true,
            shouldTouch: true,
          });
        }
      } catch (e: any) {
        if (!cancelled) {
          setValue("feeAmount", "0", {
            shouldValidate: false,
            shouldDirty: false,
            shouldTouch: false,
          });
          setError("feeAmount", { type: "custom", message: e.message });
        }
      }
    };

    Promise.resolve().then(run);

    return () => {
      cancelled = true;
    };
  }, [
    feeRate,
    amount,
    term,
    providerIdsJson,
    setValue,
    setError,
    clearErrors,
    calculateFeeAmount,
  ]);

  const { coinSymbol, displayUSD } = getNetworkConfigBTC();
  const { coinSymbol: bbnCoinSymbol, displayUSD: displayUSDBBN } =
    getNetworkConfigBBN();

  const btcPrice = usePrice(coinSymbol);
  const bbnPrice = usePrice(bbnCoinSymbol);
  const feeAmountBTC = satoshiToBtc(Number(feeAmountSat || 0));
  const feeAmountHint = displayUSD
    ? calculateTokenValueInCurrency(feeAmountBTC, btcPrice)
    : undefined;

  const totalBTC = useMemo(
    () => maxDecimals(parseFloat(amount || "0") + feeAmountBTC, 8),
    [amount, feeAmountBTC],
  );
  const totalHint = displayUSD
    ? calculateTokenValueInCurrency(totalBTC, btcPrice)
    : undefined;
  const bbnFeeAmountHint =
    displayUSDBBN && BBN_FEE_AMOUNT
      ? calculateTokenValueInCurrency(Number(BBN_FEE_AMOUNT), bbnPrice)
      : undefined;

  const [feeModalVisible, setFeeModalVisible] = useState(false);
  const handleFeeRateSubmit = (value: number) => {
    setValue("feeRate", value.toString(), {
      shouldValidate: true,
      shouldDirty: true,
      shouldTouch: true,
    });
    setFeeModalVisible(false);
  };

  return (
    <>
      <CoreFeesSection
        feeRate={feeRate || 0}
        onFeeRateEdit={(event?: React.MouseEvent) => {
          event?.preventDefault?.();
          event?.stopPropagation?.();

          setFeeModalVisible(true);
        }}
        feeAmount={feeAmountBTC}
        coinSymbol={coinSymbol}
        feeAmountHint={feeAmountHint}
        total={totalBTC}
        totalHint={totalHint}
        bbnFeeAmount={BBN_FEE_AMOUNT}
        bbnCoinSymbol={bbnCoinSymbol}
        bbnFeeAmountHint={bbnFeeAmountHint}
      />

      <FeeModal
        open={feeModalVisible}
        onClose={() => setFeeModalVisible(false)}
        onSubmit={handleFeeRateSubmit}
      />
    </>
  );
}
