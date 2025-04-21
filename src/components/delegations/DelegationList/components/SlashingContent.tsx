import Link from "next/link";
import { useMemo } from "react";

import { DOCUMENTATION_LINKS } from "@/app/constants";
import {
  DelegationV2,
  DelegationV2StakingState,
} from "@/app/types/delegationsV2";
import { NetworkInfo } from "@/app/types/networkInfo";
import { getNetworkConfigBTC } from "@/config/network/btc";
import { satoshiToBtc } from "@/utils/btc";
import { getSlashingAmount } from "@/utils/delegations/slashing";
import { maxDecimals } from "@/utils/maxDecimals";
import { getBbnParamByVersion } from "@/utils/params";
import { blocksToDisplayTime } from "@/utils/time";

interface SlashingContentProps {
  delegation: DelegationV2;
  networkInfo?: NetworkInfo;
}

const { coinName } = getNetworkConfigBTC();

export const SlashingContent = ({
  delegation,
  networkInfo,
}: SlashingContentProps) => {
  const slashingAmount = useMemo(() => {
    const params = getBbnParamByVersion(
      delegation.paramsVersion,
      networkInfo?.params.bbnStakingParams.versions || [],
    );
    const amount = getSlashingAmount(delegation.stakingAmount, params);

    return amount;
  }, [delegation, networkInfo]);

  const unbondingTime = useMemo(() => {
    const unbondingTimeBlocks =
      networkInfo?.params?.bbnStakingParams.latestParam.unbondingTime ?? 1008;
    return {
      blocks: unbondingTimeBlocks,
      time: blocksToDisplayTime(unbondingTimeBlocks),
    };
  }, [networkInfo]);

  if (delegation.startHeight === undefined) {
    return (
      <>
        This Finality Provider has been slashed due to double voting.{" "}
        <Link
          className="text-secondary-main"
          target="_blank"
          href={DOCUMENTATION_LINKS.TECHNICAL_PRELIMINARIES}
        >
          Learn more
        </Link>
      </>
    );
  }

  // For the SLASHED state specifically, show the information with waiting period
  if (delegation.state === DelegationV2StakingState.SLASHED) {
    return (
      <>
        The Finality Provider you selected has been slashed, resulting in{" "}
        <b>
          {maxDecimals(satoshiToBtc(slashingAmount ?? 0), 8)} {coinName}
        </b>{" "}
        being deducted from your delegation. It will take {unbondingTime.blocks}{" "}
        blocks (~ {unbondingTime.time}) before it becomes withdrawable.{" "}
        <Link
          className="text-secondary-main"
          target="_blank"
          href={DOCUMENTATION_LINKS.TECHNICAL_PRELIMINARIES}
        >
          Learn more
        </Link>
      </>
    );
  }

  // For other slashing-related states
  return (
    <>
      The Finality Provider you selected has been slashed, resulting in{" "}
      <b>
        {maxDecimals(satoshiToBtc(slashingAmount ?? 0), 8)} {coinName}
      </b>{" "}
      being deducted from your delegation due to the finality provider double
      voting.{" "}
      <Link
        className="text-secondary-main"
        target="_blank"
        href={DOCUMENTATION_LINKS.TECHNICAL_PRELIMINARIES}
      >
        Learn more
      </Link>
    </>
  );
};
