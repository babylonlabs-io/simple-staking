import { FaBitcoin } from "react-icons/fa";

import { getNetworkConfigBTC } from "@/config/network/btc";
import { satoshiToBtc } from "@/utils/btc";
import { maxDecimals } from "@/utils/maxDecimals";

interface Amount {
  value: number;
}

const { coinName } = getNetworkConfigBTC();

export function Amount({ value }: Amount) {
  return (
    <div className="inline-flex gap-1 items-center order-1 whitespace-nowrap">
      <FaBitcoin className="text-primary" />
      <p>
        {maxDecimals(satoshiToBtc(value), 8)} {coinName}
      </p>
    </div>
  );
}
