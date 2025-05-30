import { useFormContext, useWatch } from "@babylonlabs-io/core-ui";

import bitcoin from "@/app/assets/bitcoin.png";
import { usePrice } from "@/app/hooks/client/api/usePrices";
import { useBalanceState } from "@/app/state/BalanceState";
import { AuthGuard } from "@/components/common/AuthGuard";
import { getNetworkConfigBTC } from "@/config/network/btc";
import { satoshiToBtc } from "@/utils/btc";
import { calculateTokenValueInCurrency } from "@/utils/formatCurrency";
import { maxDecimals } from "@/utils/maxDecimals";

import { AmountField } from "./AmountField";
import { SubSection } from "./SubSection";

export const AmountSubsection = () => {
  const { totalBtcBalance } = useBalanceState();

  const btcAmount = useWatch({ name: "amount", defaultValue: "0" });
  const { setValue } = useFormContext();

  const { coinSymbol } = getNetworkConfigBTC();
  const btcInUsd = usePrice(coinSymbol);

  const btcAmountValue = parseFloat(btcAmount || "0");
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

  return (
    <SubSection className="flex flex-col justify-between w-full content-center gap-4">
      <div className="font-normal items-center flex flex-row justify-between w-full content-center">
        <div className="flex items-center gap-2">
          <img
            src={bitcoin.src}
            alt="bitcoin"
            className="max-w-[40px] max-h-[40px]"
          />
          <div className="text-lg">Bitcoin</div>
        </div>
        <AmountField autoFocus />
      </div>

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
