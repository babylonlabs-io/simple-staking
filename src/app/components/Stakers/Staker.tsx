import { getNetworkConfig } from "@/config/network.config";
import { satoshiToBtc } from "@/utils/btcConversions";
import { maxDecimals } from "@/utils/maxDecimals";

import { Hash } from "../Hash/Hash";

interface StakerProps {
  pkHex: string;
  delegations: number;
  activeTVLSat: number;
}

export const Staker: React.FC<StakerProps> = ({
  pkHex,
  delegations,
  activeTVLSat,
}) => {
  const { coinName } = getNetworkConfig();

  return (
    <div className="card border bg-base-300 p-4 text-sm dark:border-0 dark:bg-base-200">
      <div className="mb-2 block lg:hidden">
        <Hash value={pkHex} address small noFade />
      </div>
      <div className="grid grid-cols-2 grid-rows-1 gap-2 lg:grid-cols-3">
        <div className="hidden lg:block">
          <Hash value={pkHex} address small noFade />
        </div>
        <div>
          <p className="text-xs lg:hidden dark:text-neutral-content">
            Delegations
          </p>
          <p>{delegations || 0}</p>
        </div>
        <div>
          <p className="text-xs lg:hidden dark:text-neutral-content">Stake</p>
          <p>
            {activeTVLSat
              ? `${maxDecimals(satoshiToBtc(activeTVLSat), 8)} ${coinName}`
              : 0}
          </p>
        </div>
      </div>
    </div>
  );
};
