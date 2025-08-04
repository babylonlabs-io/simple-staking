import bitcoin from "@/ui/common/assets/bitcoin.png";
import { Status } from "@/ui/common/components/Delegations/DelegationList/components/Status";
import { Hash } from "@/ui/common/components/Hash/Hash";
import { FinalityProviderLogo } from "@/ui/common/components/Staking/FinalityProviders/FinalityProviderLogo";
import { getNetworkConfigBTC } from "@/ui/common/config/network/btc";
import { chainLogos } from "@/ui/common/constants";
import {
  DelegationV2,
  DelegationWithFP,
} from "@/ui/common/types/delegationsV2";
import { FinalityProvider } from "@/ui/common/types/finalityProviders";
import { satoshiToBtc } from "@/ui/common/utils/btc";
import { maxDecimals } from "@/ui/common/utils/maxDecimals";
import { durationTillNow } from "@/ui/common/utils/time";

import {
  ActivityCardData,
  ActivityCardDetailItem,
  ActivityListItemData,
} from "../components/ActivityCard/ActivityCard";

const { coinName } = getNetworkConfigBTC();

export const transformDelegationToActivityCard = (
  delegation: DelegationV2,
  finalityProvider: FinalityProvider | undefined,
  index: number,
): ActivityCardData => {
  // Create a delegation with FP for the Status component
  const delegationWithFP: DelegationWithFP = {
    ...delegation,
    fp: finalityProvider as FinalityProvider,
  };

  const details: ActivityCardDetailItem[] = [
    {
      label: "Status",
      value: finalityProvider ? (
        <Status delegation={delegationWithFP} showTooltip={false} />
      ) : (
        "Unknown"
      ),
    },
    {
      label: "Inception",
      value: delegation.bbnInceptionTime
        ? durationTillNow(delegation.bbnInceptionTime, Date.now())
        : "N/A",
    },
    {
      label: "Tx Hash",
      value: (
        <Hash
          value={delegation.stakingTxHashHex}
          address
          small
          noFade
          size="caption"
        />
      ),
    },
  ];

  const listItems: {
    label: string;
    items: ActivityListItemData[];
  }[] = [];

  if (finalityProvider?.bsnId) {
    const bsnLogo =
      chainLogos[finalityProvider.bsnId] || chainLogos.placeholder;
    listItems.push({
      label: "BSN",
      items: [
        {
          icon: bsnLogo,
          iconAlt: finalityProvider.bsnId,
          name: finalityProvider.bsnId,
          id: finalityProvider.bsnId,
        },
      ],
    });
  }

  if (finalityProvider) {
    listItems.push({
      label: "Finality Provider",
      items: [
        {
          icon: (
            <FinalityProviderLogo
              logoUrl={finalityProvider.logo_url}
              rank={finalityProvider.rank}
              moniker={finalityProvider.description?.moniker}
              className="w-4 h-4"
            />
          ),
          iconAlt: finalityProvider.description?.moniker || "Finality Provider",
          name:
            finalityProvider.description?.moniker ||
            `Provider ${finalityProvider.rank}`,
          id: finalityProvider.btcPk,
        },
      ],
    });
  }

  const stepLabel = index === 0 ? "Original Stake" : `Expansion ${index}`;
  const formattedAmount = `${maxDecimals(satoshiToBtc(delegation.stakingAmount), 8)} ${coinName}`;

  return {
    formattedAmount: `${stepLabel} - ${formattedAmount}`,
    icon: bitcoin,
    iconAlt: "bitcoin",
    details,
    listItems: listItems.length > 0 ? listItems : undefined,
  };
};
