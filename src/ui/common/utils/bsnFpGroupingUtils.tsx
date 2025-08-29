import { getRegistry } from "@babylonlabs-io/bsn-registry";

import bsnPlaceholder from "@/ui/common/assets/chain-placeholder.svg";
import { FinalityProviderLogo } from "@/ui/common/components/Staking/FinalityProviders/FinalityProviderLogo";
import { network } from "@/ui/common/config/network/bbn";
import { FinalityProvider } from "@/ui/common/types/finalityProviders";

import { ActivityCardDetailItem } from "../components/ActivityCard/ActivityCard";

const registry = getRegistry(network === "mainnet" ? "mainnet" : "testnet");

/**
 * Creates grouped details for BSN/FP pairs from finality provider Bitcoin public keys
 * This utility is shared between main activity cards and expansion history
 */
export function createBsnFpGroupedDetails(
  finalityProviderBtcPksHex: string[],
  finalityProviderMap: Map<string, FinalityProvider>,
): { label?: string; items: ActivityCardDetailItem[] }[] {
  const groupedDetails: { label?: string; items: ActivityCardDetailItem[] }[] =
    [];

  if (!finalityProviderBtcPksHex || finalityProviderBtcPksHex.length === 0) {
    return groupedDetails;
  }

  finalityProviderBtcPksHex.forEach((fpBtcPk) => {
    const fp = finalityProviderMap.get(fpBtcPk);
    if (fp && fp.bsnId) {
      // Create a group for each BSN+FP pair
      groupedDetails.push({
        items: [
          {
            label: "BSN",
            value: (
              <div className="flex items-center gap-2">
                <img
                  src={registry[fp.bsnId]?.logoUrl || bsnPlaceholder}
                  alt={fp.bsnId}
                  className="w-4 h-4 rounded-full object-cover"
                />
                <span>{fp.bsnId}</span>
              </div>
            ),
          },
          {
            label: "Finality Provider",
            value: (
              <div className="flex items-center gap-2">
                <FinalityProviderLogo
                  logoUrl={fp.logo_url}
                  rank={fp.rank}
                  moniker={fp.description?.moniker}
                  className="w-4 h-4"
                />
                <span>{fp.description?.moniker || `Provider ${fp.rank}`}</span>
              </div>
            ),
          },
        ],
      });
    }
  });

  return groupedDetails;
}
