import { AmountSubsection, useFormContext } from "@babylonlabs-io/core-ui";

import babylon from "@/infrastructure/babylon";
import { getNetworkConfigBBN } from "@/ui/common/config/network/bbn";

const { logo, coinSymbol, displayUSD } = getNetworkConfigBBN();

interface AmountFieldProps {
  balance: number;
  price: number;
}

export const AmountField = ({ balance, price }: AmountFieldProps) => {
  const { setValue, getValues, trigger } = useFormContext();

  const handleMax = async () => {
    // feeAmount is stored in ubbn units (BigInt encoded as number)
    const feeAmountUbbn: number = getValues("feeAmount") || 0;
    const feeAmountBaby = babylon.utils.ubbnToBaby(BigInt(feeAmountUbbn));
    const maxBaby = Math.max(balance - feeAmountBaby, 0);

    setValue("amount", maxBaby.toString(), {
      shouldValidate: true,
      shouldDirty: true,
      shouldTouch: true,
    });

    // retrigger validation so Submit button state updates
    await trigger();
  };

  return (
    <div className="relative">
      <AmountSubsection
        displayBalance
        fieldName="amount"
        currencyIcon={logo}
        currencyName={coinSymbol}
        placeholder="Enter Amount"
        balanceDetails={{
          displayUSD,
          symbol: coinSymbol,
          balance,
          price,
          decimals: 2,
        }}
      />
      <button
        type="button"
        onClick={handleMax}
        className="absolute right-0 top-1/2 -translate-y-1/2 text-primary text-sm font-medium"
      >
        Max
      </button>
    </div>
  );
};
