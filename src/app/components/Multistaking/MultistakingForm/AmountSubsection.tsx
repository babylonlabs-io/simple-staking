import { HiddenField, useFormContext, useWatch } from "@babylonlabs-io/core-ui";

import bitcoin from "@/app/assets/bitcoin.png";
import { usePrice } from "@/app/hooks/client/api/usePrices";
import { useBalanceState } from "@/app/state/BalanceState";
import { AuthGuard } from "@/components/common/AuthGuard";
import { getNetworkConfigBTC } from "@/config/network/btc";
import { satoshiToBtc } from "@/utils/btc";
import { calculateTokenValueInCurrency } from "@/utils/formatCurrency";
import { maxDecimals } from "@/utils/maxDecimals";

import { SubSection } from "./SubSection";

export const AmountSubsection = () => {
  const { totalBtcBalance } = useBalanceState();
  const btcAmount = useWatch({ name: "amount", defaultValue: "0" });
  const { coinSymbol } = getNetworkConfigBTC();
  const btcInUsd = usePrice(coinSymbol);
  const { setValue } = useFormContext();

  const btcAmountValue = parseFloat(btcAmount || 0);
  const btcAmountUsd = calculateTokenValueInCurrency(btcAmountValue, btcInUsd, {
    zeroDisplay: "$0.00",
  });
  const formattedBalance = satoshiToBtc(totalBtcBalance);

  const handleSetMaxBalance = () => {
    setValue("amount", formattedBalance.toString(), {
      shouldValidate: true,
      shouldDirty: true,
      shouldTouch: true,
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue("amount", e.target.value, {
      shouldValidate: true,
      shouldDirty: true,
      shouldTouch: true,
    });
  };

  return (
    <SubSection className="flex flex-col justify-between w-full content-center gap-4">
      <AmountField />

      <AuthGuard>
        <div className="flex text-sm flex-row justify-between w-full content-center">
          <div>
            Balance:{" "}
            <u className="cursor-pointer" onClick={handleSetMaxBalance}>
              {maxDecimals(formattedBalance, 8)}
            </u>{" "}
            {coinSymbol}
          </div>
          <div>{btcAmountUsd} USD</div>
        </div>
      </AuthGuard>
    </SubSection>
  );
};
