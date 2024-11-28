import { Hint } from "@/components/common/Hint";
import { getNetworkConfig } from "@/config/network.config";
import { satoshiToBtc } from "@/utils/btc";
import { maxDecimals } from "@/utils/maxDecimals";

interface DelegationProps {
  totalValue: number;
}

const { coinName } = getNetworkConfig();

export function Delegations({ totalValue }: DelegationProps) {
  return (
    <div className="flex items-center gap-1">
      <p className="hidden sm:flex lg:hidden">Delegation:</p>
      <p>
        {maxDecimals(satoshiToBtc(totalValue), 8)} {coinName}
      </p>
      <Hint tooltip="Total delegation" />
    </div>
  );
}
