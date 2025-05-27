import { useFormContext, useWatch } from "@babylonlabs-io/core-ui";
import Image from "next/image";
import { useEffect } from "react";

import { chainLogos } from "@/app/assets/chains";
import { MultistakingPreviewModal } from "@/app/components/Modals/MultistakingModal/MultistakingStartModal";
import { getNetworkConfigBTC } from "@/config/network/btc";
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
  const { coinSymbol } = getNetworkConfigBTC();

  const { setValue, getValues } = useFormContext();

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
      onProceed={() => {
        setPreviewModalOpen(false);
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
          "Selected FP",
      }))}
      details={{
        stakeAmount: `${parseFloat(btcAmount) || 0} ${coinSymbol}`,
        feeRate: `${feeRate} sat/vB`,
        transactionFees: `${parseFloat(feeAmount) || 0} ${coinSymbol}`,
        term: {
          blocks: "5000 blocks",
          duration: "~ 35 days",
        },
        onDemandBonding: "Enabled (~ 7 days unbonding time)",
        unbondingFee: "0.0001 BTC",
      }}
    />
  );
};
