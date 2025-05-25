import { useWatch } from "@babylonlabs-io/core-ui";
import Image from "next/image";

import babylon from "@/app/assets/babylon-genesis.png";
import { KeybaseImage } from "@/app/components/KeybaseImage/KeybaseImage";
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
          icon: <Image src={babylon} alt="babylon" className="w-6 h-6" />,
          name: "Babylon Genesis",
        },
      ]}
      finalityProviders={selectedProviders.map((provider) => ({
        icon: (
          <KeybaseImage
            identity={provider.description?.identity}
            moniker={provider.description?.moniker}
            size="small"
          />
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
