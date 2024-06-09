import { FaBitcoin } from "react-icons/fa";

import { getNetworkConfig } from "@/config/network.config";
import { satoshiToBtc } from "@/utils/btcConversions";
import { maxDecimals } from "@/utils/maxDecimals";
import { trim } from "@/utils/trim";
import { Network } from "@/utils/wallet/wallet_provider";

interface SummaryProps {
  address: string;
  totalStakedSat: number;
  balanceSat: number;
}

export const Summary: React.FC<SummaryProps> = ({
  address,
  totalStakedSat,
  balanceSat,
}) => {
  const { coinName } = getNetworkConfig();
  const onMainnet = getNetworkConfig().network === Network.MAINNET;

  return (
    <div className="card flex flex-col gap-2 bg-base-300 p-4 shadow-sm xl:flex-row xl:items-center xl:justify-between xl:gap-4">
      <h3 className="mb-4 font-bold xl:mb-0">Your staking summary</h3>
      <div className="flex flex-1 justify-between gap-2">
        <div className="flex flex-col gap-1 text-sm xl:flex-1 xl:flex-row xl:items-center xl:justify-center xl:gap-2 xl:text-base">
          <p className="dark:text-neutral-content">Total staked</p>
          <div className="flex items-center gap-1">
            <FaBitcoin className="text-primary" size={16} />
            <p className="whitespace-nowrap font-semibold">
              {totalStakedSat
                ? maxDecimals(satoshiToBtc(totalStakedSat), 8)
                : 0}{" "}
              {coinName}
            </p>
          </div>
        </div>
        <div className="divider divider-horizontal xl:m-0" />
        <div className="flex flex-col gap-1 text-sm xl:flex-1 xl:flex-row xl:items-center xl:justify-center xl:gap-2 xl:text-base">
          <p className="dark:text-neutral-content">Balance</p>
          <div className="flex items-center gap-1">
            <FaBitcoin className="text-primary" size={16} />
            <p className="whitespace-nowrap font-semibold">
              {balanceSat ? maxDecimals(satoshiToBtc(balanceSat), 8) : 0}{" "}
              {coinName}
            </p>
          </div>
          <p className="hidden xl:flex xl:text-sm 2xl:ml-2">{trim(address)}</p>
        </div>
      </div>
      <div
        className={`divider m-0 xl:divider-horizontal xl:m-0 ${onMainnet && "xl:hidden"}`}
      />
      <div className="flex justify-between gap-2 text-sm">
        <p className="xl:hidden">{trim(address)}</p>
        {/* Not visible on Mainnet */}
        {!onMainnet && (
          <a
            href="https://discord.com/invite/babylonglobal"
            target="_blank"
            rel="noopener noreferrer"
            className="font-light text-primary hover:underline"
          >
            Get Test Tokens
          </a>
        )}
      </div>
    </div>
  );
};
