import { useWatch } from "@babylonlabs-io/bbn-core-ui";

import { getNetworkConfigBTC } from "@/config/network/btc";
import { satoshiToBtc } from "@/utils/btc";

import { FeeItem } from "./FeeItem";

const { coinSymbol } = getNetworkConfigBTC();

export function BTCFeeAmount() {
  const feeAmount = useWatch({ name: "feeAmount" });

  return (
    <FeeItem title="Bitcoin Network Fee" hint="">
      {satoshiToBtc(parseFloat(feeAmount))} {coinSymbol}
    </FeeItem>
  );
}
