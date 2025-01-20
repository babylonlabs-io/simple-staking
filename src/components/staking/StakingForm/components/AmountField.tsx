import { NumberField, Text } from "@babylonlabs-io/bbn-core-ui";

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
      <Text as="span" variant="body1">
        Amount
      </Text>
      <Text as="span" variant="body2">
        min/max: {satoshiToBtc(min)}/{satoshiToBtc(max)} {coinSymbol}
      </Text>
    </div>
  );

  return (
    <NumberField
      name="amount"
      controlClassName="mb-6 [&_.bbn-input]:py-2.5 [&_.bbn-form-control-title]:mb-1 [&_.bbn-input-field]:text-base"
      label={label}
      placeholder={coinSymbol}
    />
  );
}
