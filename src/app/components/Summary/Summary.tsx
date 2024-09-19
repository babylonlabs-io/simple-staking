import { useEffect, useState } from "react";
import { AiOutlineInfoCircle } from "react-icons/ai";
import { FaBitcoin } from "react-icons/fa";
import { Tooltip } from "react-tooltip";

import { useGlobalParams } from "@/app/context/api/GlobalParamsProvider";
import { useBtcHeight } from "@/app/context/mempool/BtcHeightProvider";
import { useHealthCheck } from "@/app/hooks/useHealthCheck";
import { getNetworkConfig } from "@/config/network.config";
import { satoshiToBtc } from "@/utils/btcConversions";
import {
  getCurrentGlobalParamsVersion,
  ParamsWithContext,
} from "@/utils/globalParams";
import { maxDecimals } from "@/utils/maxDecimals";
import { Network } from "@/utils/wallet/wallet_provider";

import { LoadingSmall } from "../Loading/Loading";
import { StakerPoints } from "../Points/StakerPoints";

interface SummaryProps {
  loading?: boolean;
  totalStakedSat: number;
  btcWalletBalanceSat?: number;
  publicKeyNoCoord: string;
}

export const Summary: React.FC<SummaryProps> = ({
  loading = false,
  totalStakedSat,
  btcWalletBalanceSat,
  publicKeyNoCoord,
}) => {
  const { coinName } = getNetworkConfig();
  const onMainnet = getNetworkConfig().network === Network.MAINNET;
  const [paramWithCtx, setParamWithCtx] = useState<
    ParamsWithContext | undefined
  >();

  const btcHeight = useBtcHeight();
  const globalParams = useGlobalParams();
  const { isApiNormal, isGeoBlocked } = useHealthCheck();

  useEffect(() => {
    if (!btcHeight || !globalParams.data) {
      return;
    }
    const paramCtx = getCurrentGlobalParamsVersion(
      btcHeight + 1,
      globalParams.data,
    );
    setParamWithCtx(paramCtx);
  }, [btcHeight, globalParams]);

  return (
    <div className="card flex flex-col gap-2 bg-base-300 p-4 shadow-sm xl:gap-4">
      <h3 className="mb-4 font-bold xl:mb-0">Your staking summary</h3>
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <div className="flex flex-1 flex-col gap-2 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex flex-1 gap-2 text-sm flex-col xl:flex-row xl:items-center justify-start xl:justify-between">
              <div className="flex items-center gap-1 overflow-x-auto whitespace-nowrap">
                <p className="dark:text-neutral-content">Total staked</p>
                <span
                  className="cursor-pointer text-xs"
                  data-tooltip-id="tooltip-total-staked"
                  data-tooltip-content={`Total staked is updated after ${paramWithCtx?.currentVersion?.confirmationDepth || 10} confirmations`}
                  data-tooltip-place="bottom"
                >
                  <AiOutlineInfoCircle />
                </span>
                <Tooltip id="tooltip-total-staked" className="tooltip-wrap" />
              </div>
              <div className="flex items-center gap-1 overflow-x-auto whitespace-nowrap">
                <FaBitcoin className="text-primary" size={16} />
                <p className="whitespace-nowrap font-semibold">
                  {totalStakedSat
                    ? maxDecimals(satoshiToBtc(totalStakedSat), 8)
                    : 0}{" "}
                  {coinName}
                </p>
              </div>
            </div>
            {isApiNormal && !isGeoBlocked && (
              <>
                <div className="divider xl:divider-horizontal xl:mx-4 my-0" />
                <div className="flex flex-1 gap-2 text-sm flex-col xl:flex-row xl:items-center justify-start xl:justify-between">
                  <div className="flex items-center gap-1 overflow-x-auto whitespace-nowrap">
                    <p className="dark:text-neutral-content">Total points</p>
                    <span
                      className="cursor-pointer text-xs"
                      data-tooltip-id={"tooltip-total-points"}
                      data-tooltip-content={`The points measure your staking activities based on your BTC public key. Please check FAQ for further info.`}
                    >
                      <AiOutlineInfoCircle />
                    </span>
                    <Tooltip
                      id={"tooltip-total-points"}
                      className="tooltip-wrap"
                    />
                  </div>
                  <div className="flex items-center gap-1 overflow-x-auto whitespace-nowrap">
                    <StakerPoints publicKeyNoCoord={publicKeyNoCoord} />
                  </div>
                </div>
              </>
            )}
            <div className="divider xl:divider-horizontal xl:mx-4 my-0" />
            <div className="flex flex-1 gap-1 text-sm flex-col xl:flex-row xl:items-center justify-start xl:justify-between">
              <div className="flex items-center gap-1 overflow-x-auto whitespace-nowrap">
                <p className="dark:text-neutral-content">Stakable Balance</p>
                <span
                  className="cursor-pointer text-xs"
                  data-tooltip-id={"tooltip-stakeable-balance"}
                  data-tooltip-content={`Stakable balance only includes confirmed Bitcoin balance. 
                It does not include balance stemming from pending transactions.`}
                >
                  <AiOutlineInfoCircle />
                </span>
                <Tooltip
                  id={"tooltip-stakeable-balance"}
                  className="tooltip-wrap"
                />
              </div>
              <div className="flex items-center gap-1 overflow-x-auto whitespace-nowrap">
                <FaBitcoin className="text-primary" size={16} />
                {typeof btcWalletBalanceSat === "number" ? (
                  <p
                    className="whitespace-nowrap font-semibold"
                    data-testid="balance"
                  >
                    {maxDecimals(satoshiToBtc(btcWalletBalanceSat), 8)}{" "}
                    {coinName}
                  </p>
                ) : loading ? (
                  <LoadingSmall text="Loading..." />
                ) : (
                  "n.a."
                )}
              </div>
            </div>
          </div>
        </div>
        {!onMainnet && (
          <a
            href="https://discord.com/invite/babylonglobal"
            target="_blank"
            rel="noopener noreferrer"
            className="font-light text-primary hover:underline xl:whitespace-nowrap text-center"
          >
            Get Test Tokens
          </a>
        )}
      </div>
    </div>
  );
};
