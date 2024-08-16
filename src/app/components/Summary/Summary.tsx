import { AiOutlineInfoCircle } from "react-icons/ai";
import { FaBitcoin } from "react-icons/fa";
import { Tooltip } from "react-tooltip";

import { getNetworkConfig } from "@/config/network.config";
import { satoshiToBtc } from "@/utils/btcConversions";
import { maxDecimals } from "@/utils/maxDecimals";
import { Network } from "@/utils/wallet/wallet_provider";

import { LoadingSmall } from "../Loading/Loading";

interface SummaryProps {
  totalStakedSat: number;
  btcWalletBalanceSat?: number;
}

export const Summary: React.FC<SummaryProps> = ({
  totalStakedSat,
  btcWalletBalanceSat,
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
          <p className="dark:text-neutral-content">Stakable Balance</p>
          <div className="flex items-center gap-1">
            <FaBitcoin className="text-primary" size={16} />
            {typeof btcWalletBalanceSat === "number" ? (
              <p className="whitespace-nowrap font-semibold">
                {maxDecimals(satoshiToBtc(btcWalletBalanceSat), 8)} {coinName}
              </p>
            ) : (
              <LoadingSmall text="Loading..." />
            )}
          </div>
          <div>
            <span
              className="cursor-pointer text-xs"
              data-tooltip-id={"tooltip-stakeable-balance"}
              data-tooltip-content={`Stakable balance only includes confirmed Bitcoin balance. 
              It does not include balance stemming from pending transactions.`}
              data-tooltip-place="top"
            >
              <AiOutlineInfoCircle />
            </span>
            <Tooltip
              id={"tooltip-stakeable-balance"}
              className="tooltip-wrap"
            />
          </div>
          {!onMainnet && (
            <a
              href="https://discord.com/invite/babylonglobal"
              target="_blank"
              rel="noopener noreferrer"
              className="font-light text-primary hover:underline text-right lg:text-left"
            >
              Get Test Tokens
            </a>
          )}
        </div>
      </div>
    </div>
  );
};
