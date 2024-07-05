import Image from "next/image";
import { Fragment, useEffect, useState } from "react";

import bitcoinWhite from "@/app/assets/bitcoin-white.svg";
import { useGlobalParams } from "@/app/context/api/GlobalParamsProvider";
import {
  StakingStats,
  useStakingStats,
} from "@/app/context/api/StakingStatsProvider";
import { useBtcHeight } from "@/app/context/mempool/BtcHeightProvider";
import { GlobalParamsVersion } from "@/app/types/globalParams";
import { getNetworkConfig } from "@/config/network.config";
import { satoshiToBtc } from "@/utils/btcConversions";
import {
  ParamsWithContext,
  getCurrentGlobalParamsVersion,
} from "@/utils/globalParams";
import { maxDecimals } from "@/utils/maxDecimals";

import { Controls } from "./Controls";
import confirmedTvl from "./icons/confirmed-tvl.svg";
import pendingStake from "./icons/pending-stake.svg";

interface StatsProps {
  onStaking: () => void;
  onConnect: () => void;
  address: string;
}

const buildNextCapText = (
  coinName: string,
  btcHeight: number,
  nextVersion: GlobalParamsVersion,
) => {
  const { stakingCapHeight, stakingCapSat, activationHeight } = nextVersion;
  if (stakingCapHeight) {
    const remainingBlocks = activationHeight - btcHeight - 1;
    return {
      title: "Staking Window",
      value: `opens in ${remainingBlocks} ${remainingBlocks == 1 ? "block" : "blocks"}`,
    };
  } else if (stakingCapSat) {
    return {
      title: "Next Staking TVL Cap",
      value: `${maxDecimals(satoshiToBtc(stakingCapSat), 8)} ${coinName}`,
    };
  }
};

const buildStakingCapSection = (
  coinName: string,
  btcHeight: number,
  paramsCtx: ParamsWithContext,
) => {
  const { currentVersion, nextVersion, isApprochingNextVersion } = paramsCtx;
  if (!currentVersion) {
    return;
  }
  if (isApprochingNextVersion && nextVersion) {
    return buildNextCapText(coinName, btcHeight, nextVersion);
  }
  const { stakingCapHeight, stakingCapSat, confirmationDepth } = currentVersion;
  if (stakingCapHeight) {
    const numOfBlockLeft = stakingCapHeight + confirmationDepth - btcHeight - 1;
    return {
      title: "Staking Window",
      value:
        numOfBlockLeft > 0
          ? `closes in ${numOfBlockLeft} ${numOfBlockLeft == 1 ? "block" : "blocks"}`
          : "closed",
    };
  } else if (stakingCapSat) {
    return {
      title: "Staking TVL Cap",
      value: `${maxDecimals(satoshiToBtc(stakingCapSat), 8)} ${coinName}`,
    };
  }
};

export const Stats: React.FC<StatsProps> = ({
  onConnect,
  onStaking,
  address,
}) => {
  const [stakingStats, setStakingStats] = useState<StakingStats | undefined>({
    activeTVLSat: 0,
    totalTVLSat: 0,
    activeDelegations: 0,
    totalDelegations: 0,
    totalStakers: 0,
    unconfirmedTVLSat: 0,
  });
  const [stakingCapText, setStakingCapText] = useState<{
    title: string;
    value: string;
  }>({
    title: "Staking TVL Cap",
    value: "-",
  });
  const [isLoading, setIsLoading] = useState(true);
  const stakingStatsProvider = useStakingStats();
  const btcHeight = useBtcHeight();
  const globalParams = useGlobalParams();

  const { coinName } = getNetworkConfig();

  // Load the data from staking stats provider
  useEffect(() => {
    if (stakingStatsProvider.data) {
      setStakingStats(stakingStatsProvider.data);
    }
    setIsLoading(stakingStatsProvider.isLoading || globalParams.isLoading);
  }, [stakingStatsProvider, globalParams]);

  useEffect(() => {
    if (!btcHeight || !globalParams.data) {
      return;
    }
    const paramsWithCtx = getCurrentGlobalParamsVersion(
      btcHeight + 1,
      globalParams.data,
    );
    if (!paramsWithCtx) {
      return;
    }
    const cap = buildStakingCapSection(coinName, btcHeight, paramsWithCtx);
    if (cap) setStakingCapText(cap);
  }, [globalParams, btcHeight, stakingStats, coinName]);

  const formatter = Intl.NumberFormat("en", {
    notation: "compact",
    maximumFractionDigits: 2,
  });

  const sections = [
    [
      {
        title: stakingCapText.title,
        value: stakingCapText.value,
      },
      {
        title: "Confirmed TVL",
        value: stakingStats?.activeTVLSat
          ? `${maxDecimals(satoshiToBtc(stakingStats.activeTVLSat), 2)}`
          : 0,
        icon: confirmedTvl,
      },
      {
        title: "Pending Stake",
        value: stakingStats?.unconfirmedTVLSat
          ? `${maxDecimals(satoshiToBtc(stakingStats.unconfirmedTVLSat - stakingStats.activeTVLSat), 2)}`
          : 0,
        icon: pendingStake,
      },
      {
        title: "YOUR TOTAL STAKE",
        value: stakingStats?.unconfirmedTVLSat
          ? `${maxDecimals(satoshiToBtc(stakingStats.unconfirmedTVLSat - stakingStats.activeTVLSat), 2)}`
          : 0,
        icon: pendingStake,
      },
    ],
  ];

  return (
    <div>
      <div>
        {sections.map((section, index) => (
          <div
            key={index}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4"
          >
            {section.map((subSection, subIndex) => (
              <Fragment key={subSection.title}>
                <div
                  className={`flex items-center justify-center gap-2 md:flex-1 md:flex-col min-h-[240px] md:px-10 lg:px-12 border border-es-border ${subIndex <= 1 ? "form-bg" : ""}`}
                >
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      <p className="font-bold text-xl text-es-text mb-5 uppercase text-center">
                        {subSection.title}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {subSection.icon ? (
                      <Image src={bitcoinWhite} alt="bitcoin logo white" />
                    ) : (
                      ""
                    )}
                    <p className="flex-1 text-center">
                      {isLoading ? (
                        <span className="loading loading-spinner text-es-accent" />
                      ) : (
                        <strong className="text-5xl text-es-text">
                          {subSection.value}
                        </strong>
                      )}
                    </p>
                  </div>
                </div>
              </Fragment>
            ))}
          </div>
        ))}
      </div>
      <Controls onStaking={onStaking} onConnect={onConnect} address={address} />
    </div>
  );
};
