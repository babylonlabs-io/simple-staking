import {
  FeesSection,
  useField,
  useFormContext,
  useWatch,
} from "@babylonlabs-io/core-ui";
import { useDebounce } from "@uidotdev/usehooks";
import { useEffect } from "react";

import babylon from "@/infrastructure/babylon";
import { getNetworkConfigBBN } from "@/ui/common/config/network/bbn";
import { useCosmosWallet } from "@/ui/common/context/wallet/CosmosWalletProvider";
import { calculateTokenValueInCurrency } from "@/ui/common/utils/formatCurrency";

const DELAY = 500;

interface FormFields {
  validatorAddress: string;
  amount: number;
}

interface FeeFieldProps {
  calculateFee: (params: FormFields) => Promise<number>;
  babyPrice: number;
}

const { coinSymbol, displayUSD } = getNetworkConfigBBN();

export function FeeField({ babyPrice = 0, calculateFee }: FeeFieldProps) {
  const { value, onChange, onBlur } = useField({
    name: "feeAmount",
    defaultValue: 0,
  });
  const { trigger } = useFormContext();
  const { bech32Address } = useCosmosWallet();
  const values = useWatch({ name: ["amount", "validatorAddresses"] });
  const [amount, validatorAddresses] = useDebounce(values, DELAY);
  const validatorAddress = validatorAddresses?.[0];
  const babyValue = babylon.utils.ubbnToBaby(BigInt(value));

  useEffect(() => {
    const calculate = async () => {
      const valid = await trigger();
      if (valid && bech32Address) {
        onChange(await calculateFee({ amount, validatorAddress }));
      } else {
        onChange(0);
      }
      onBlur();
    };

    calculate();
  }, [
    bech32Address,
    amount,
    validatorAddress,
    calculateFee,
    trigger,
    onChange,
    onBlur,
  ]);

  return (
    <FeesSection
      bbnFeeAmount={babyValue}
      bbnCoinSymbol={coinSymbol}
      bbnFeeAmountHint={
        displayUSD ? calculateTokenValueInCurrency(babyValue, babyPrice) : ""
      }
    />
  );
}
