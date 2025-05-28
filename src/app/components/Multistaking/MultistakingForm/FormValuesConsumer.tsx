import { useFormContext, useWatch } from "@babylonlabs-io/core-ui";
import Image from "next/image";
import { useEffect } from "react";

import { chainLogos } from "@/app/assets/chains";
import { MultistakingPreviewModal } from "@/app/components/Modals/MultistakingModal/MultistakingStartModal";
import { useStakingService } from "@/app/hooks/services/useStakingService";
import type { FormFields } from "@/app/state/StakingState";
import { useStakingState } from "@/app/state/StakingState";
import { getNetworkConfigBTC } from "@/config/network/btc";
import { btcToSatoshi, satoshiToBtc } from "@/utils/btc";
import { maxDecimals } from "@/utils/maxDecimals";
import { blocksToDisplayTime } from "@/utils/time";
import { trim } from "@/utils/trim";

export const FormValuesConsumer = ({
  selectedProviders,
  previewModalOpen,
  setPreviewModalOpen,
}: {
  selectedProviders: Array<any>;
  previewModalOpen: boolean;
  setPreviewModalOpen: (open: boolean) => void;
}) => {
  const btcAmount = useWatch({ name: "amount", defaultValue: "0" });
  const feeRate = useWatch({ name: "feeRate", defaultValue: "1" });
  const feeAmount = useWatch({ name: "feeAmount", defaultValue: "0" });
  const term = useWatch({ name: "term", defaultValue: "0" });
  const { coinSymbol } = getNetworkConfigBTC();

  const { setValue, getValues } = useFormContext();
  const { createEOI } = useStakingService();

  const { stakingInfo } = useStakingState();

  useEffect(() => {
    if (selectedProviders.length > 0) {
      setValue("finalityProvider", selectedProviders[0].btcPk ?? "selected", {
        shouldValidate: true,
        shouldDirty: true,
      });

      const currentFeeRate = getValues("feeRate");
      setValue("feeRate", currentFeeRate, {
        shouldValidate: true,
        shouldDirty: true,
      });
    } else {
      setValue("finalityProvider", "", {
        shouldValidate: true,
        shouldDirty: true,
      });
    }
  }, [selectedProviders, setValue, getValues]);

  return (
    <MultistakingPreviewModal
      open={previewModalOpen}
      processing={false}
      onClose={() => setPreviewModalOpen(false)}
      onProceed={async () => {
        setPreviewModalOpen(false);

        const {
          finalityProvider,
          amount: amountValue,
          term: termValue,
          feeRate: feeRateValue,
          feeAmount: feeAmountValue,
        } = getValues();

        const formFields: FormFields = {
          finalityProvider,
          amount: btcToSatoshi(Number(amountValue)),
          term: Number(termValue),
          feeRate: Number(feeRateValue),
          feeAmount: Number(feeAmountValue),
        };

        await createEOI(formFields);
      }}
      bsns={[
        {
          icon: (
            <Image src={chainLogos.babylon} alt="babylon" className="w-6 h-6" />
          ),
          name: "Babylon Genesis",
        },
      ]}
      finalityProviders={selectedProviders.map((provider) => ({
        icon: (
          // Replace with KeybaseImage
          <div
            className={`w-6 h-6 text-[0.6rem] flex items-center justify-center rounded-full bg-secondary-main text-accent-contrast`}
          >
            {provider.rank}
          </div>
        ),
        name:
          provider.description?.moniker ||
          trim(provider.btcPk, 8) ||
          "Selected Finality Provider",
      }))}
      details={{
        stakeAmount: `${maxDecimals(parseFloat(btcAmount) || 0, 8)} ${coinSymbol}`,
        feeRate: `${feeRate} sat/vB`,
        transactionFees: `${maxDecimals(satoshiToBtc(parseFloat(feeAmount) || 0), 8)} ${coinSymbol}`,
        term: {
          blocks: `${term} blocks`,
          duration: `~ ${blocksToDisplayTime(Number(term))}`,
        },
        onDemandBonding: `Enabled (~ ${blocksToDisplayTime(
          stakingInfo?.unbondingTime,
        )} unbonding time)`,
        unbondingFee: `${maxDecimals(
          satoshiToBtc(stakingInfo?.unbondingFeeSat || 0),
          8,
        )} ${coinSymbol}`,
      }}
    />
  );
};
