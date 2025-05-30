import { useFormContext, useWatch } from "@babylonlabs-io/core-ui";
import { useEffect } from "react";

import { MultistakingPreviewModal } from "@/app/components/Modals/MultistakingModal/MultistakingStartModal";
import { chainLogos } from "@/app/constants";
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
      onProceed={handleProceed}
      bsns={bsns}
      details={details}
    />
  );
};
