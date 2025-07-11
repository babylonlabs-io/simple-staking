import { useMemo } from "react";

import { getNetworkConfigBTC } from "@/ui/legacy/config/network/btc";
import { DOCUMENTATION_LINKS } from "@/ui/legacy/constants";
import {
  DelegationV2,
  DelegationV2StakingState,
} from "@/ui/legacy/types/delegationsV2";
import { NetworkInfo } from "@/ui/legacy/types/networkInfo";
import { satoshiToBtc } from "@/ui/legacy/utils/btc";
import { getSlashingAmount } from "@/ui/legacy/utils/delegations/slashing";
import { maxDecimals } from "@/ui/legacy/utils/maxDecimals";
import { getBbnParamByVersion } from "@/ui/legacy/utils/params";
import { blocksToDisplayTime } from "@/ui/legacy/utils/time";

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
        <a
          className="text-secondary-main"
          target="_blank"
          href={DOCUMENTATION_LINKS.TECHNICAL_PRELIMINARIES}
        >
          Learn more
        </a>
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
        <a
          className="text-secondary-main"
          target="_blank"
          href={DOCUMENTATION_LINKS.TECHNICAL_PRELIMINARIES}
        >
          Learn more
        </a>
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
      <a
        className="text-secondary-main"
        target="_blank"
        href={DOCUMENTATION_LINKS.TECHNICAL_PRELIMINARIES}
      >
        Learn more
      </a>
    </>
  );
};
