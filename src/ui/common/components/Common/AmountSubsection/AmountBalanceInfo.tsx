import { useWatch } from "@babylonlabs-io/core-ui";

import { calculateTokenValueInCurrency } from "@/ui/common/utils/formatCurrency";
import { maxDecimals } from "@/ui/common/utils/maxDecimals";

interface Props {
  fieldName?: string;
  balance: number | string;
  symbol: string;
  price?: number;
  displayUSD?: boolean;
  decimals?: number;
}

export function AmountBalanceInfo({
  fieldName = "amount",
  balance,
  symbol,
  price,
  displayUSD = false,
  decimals = 8,
}: Props) {
  const amount = useWatch({ name: fieldName, defaultValue: "" });

  const amountValue = parseFloat(amount || "0");
  const amountUsd = calculateTokenValueInCurrency(amountValue, price ?? 0, {
    zeroDisplay: "$0.00",
  });

  return (
    <div className="flex text-sm flex-row justify-between w-full content-center">
      <div>
        Stakable:{" "}
        <span className="cursor-default">
          {maxDecimals(Number(balance), decimals)}
        </span>{" "}
        {symbol}
      </div>
      {displayUSD && price !== undefined && <div>{amountUsd} USD</div>}
    </div>
  );
}
