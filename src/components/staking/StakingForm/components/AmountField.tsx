import { NumberField } from "@babylonlabs-io/bbn-core-ui";

import { getNetworkConfigBTC } from "@/config/network/btc";
import { satoshiToBtc } from "@/utils/btc";

interface AmountFieldProps {
  min?: number;
  max?: number;
}

const { coinSymbol } = getNetworkConfigBTC();

export function AmountField({ min = 0, max = 0 }: AmountFieldProps) {
  const label = (
    <div className="flex flex-1 justify-between items-center">
      <span>Amount</span>
      <span>
        min/max: {satoshiToBtc(min)}/{satoshiToBtc(max)} {coinSymbol}
      </span>
    </div>
  );

  return (
    <NumberField
      name="amount"
      controlClassName="mb-4"
      label={label}
      placeholder="BTC"
    />
  );
}
