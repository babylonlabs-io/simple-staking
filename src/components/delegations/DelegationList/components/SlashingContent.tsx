import Link from "next/link";
import { useMemo } from "react";

import { DOCUMENTATION_LINKS } from "@/app/constants";
import { DelegationV2 } from "@/app/types/delegationsV2";
import { NetworkInfo } from "@/app/types/networkInfo";
import { getNetworkConfigBTC } from "@/config/network/btc";
import { satoshiToBtc } from "@/utils/btc";
import { getSlashingAmount } from "@/utils/delegations/slashing";
import { maxDecimals } from "@/utils/maxDecimals";
import { getBbnParamByVersion } from "@/utils/params";

interface SlashingContentProps {
  delegation: DelegationV2;
  networkInfo?: NetworkInfo;
}

const { coinName } = getNetworkConfigBTC();

export const SlashingContent = ({
  delegation,
  networkInfo,
}: SlashingContentProps) => {
  const slashingAmount = useMemo(
    () =>
      getSlashingAmount(
        delegation.stakingAmount,
        getBbnParamByVersion(
          delegation.paramsVersion,
          networkInfo?.params.bbnStakingParams.versions || [],
        ),
      ),
    [delegation, networkInfo],
  );

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
