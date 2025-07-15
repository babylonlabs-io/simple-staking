import { useWatch } from "@babylonlabs-io/core-ui";

import { calculateTokenValueInCurrency } from "@/ui/common/utils/formatCurrency";
import { maxDecimals } from "@/ui/common/utils/maxDecimals";

interface Props {
  /** Form field name that holds the amount currently entered by the user */
  fieldName?: string;
  /** Formatted token balance that should be displayed as stakable */
  balance: number | string;
  /** Symbol of the token the balance represents (e.g. BTC, ETH, BBN) */
  symbol: string;
  /** Current price of one token in the selected currency (USD) */
  price?: number;
  /** Whether the USD equivalent of the entered amount should be displayed */
  displayUSD?: boolean;
  /** Max decimals shown for the balance value */
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
  // Watch the current amount the user has typed into the form.
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
