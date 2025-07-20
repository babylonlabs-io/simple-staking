/**
 * Import polyfill for array.toSorted
 */
import "core-js/features/array/to-sorted";

import { Loader, TableElement } from "@babylonlabs-io/core-ui";

import warningOctagon from "@/ui/common/assets/warning-octagon.svg";
import warningTriangle from "@/ui/common/assets/warning-triangle.svg";
import { StatusView } from "@/ui/common/components/Staking/FinalityProviders/FinalityProviderTableStatusView";
import { getNetworkConfigBTC } from "@/ui/common/config/network/btc";
import { useFinalityProviderBsnState } from "@/ui/common/state/FinalityProviderBsnState";
import { FinalityProviderStateLabels } from "@/ui/common/types/finalityProviders";
import { satoshiToBtc } from "@/ui/common/utils/btc";
import { maxDecimals } from "@/ui/common/utils/maxDecimals";

interface Props {
  selectedFP?: string;
  onSelectRow?: (btcPk: string) => void;
}

export const FinalityProviderTable = ({ selectedFP, onSelectRow }: Props) => {
  const { isFetching, finalityProviders, hasError, isRowSelectable } =
    useFinalityProviderBsnState();

  const { coinSymbol } = getNetworkConfigBTC();

  const errorView = (
    <StatusView
      icon={<img src={warningTriangle} alt="Warning" width={88} height={88} />}
      title="Failed to Load"
      description={
        <>
          The finality provider list failed to load. Please check <br />
          your internet connection or try again later.
        </>
      }
    />
  );

  const loadingView = (
    <StatusView
      icon={<Loader className="text-primary-light" />}
      title="Loading Finality Providers"
    />
  );

  const noMatchesView = (
    <StatusView
      icon={<img src={warningOctagon} alt="Warning" width={160} height={160} />}
      title="No Matches Found"
    />
  );

  if (hasError) {
    return errorView;
  }

  if (isFetching && (!finalityProviders || finalityProviders.length === 0)) {
    return loadingView;
  }

  if (!isFetching && (!finalityProviders || finalityProviders.length === 0)) {
    return noMatchesView;
  }

  const handleSelect = (btcPk: string) => {
    if (onSelectRow) {
      onSelectRow(btcPk);
    }
  };

  return (
    <div className="grid grid-cols-2 gap-4 w-full h-[500px] overflow-scroll">
      {finalityProviders.map((fp) => {
        const isSelected = selectedFP === fp.btcPk;
        const isSelectable = isRowSelectable(fp);

        const totalDelegation = maxDecimals(
          satoshiToBtc(fp.activeTVLSat || 0),
          8,
        );
        const commission = maxDecimals((Number(fp.commission) || 0) * 100, 2);
        const status = FinalityProviderStateLabels[fp.state] || "Unknown";

        const attributes = {
          Status: status,
          [`${coinSymbol} PK`]: fp.btcPk
            ? `${fp.btcPk.slice(0, 5)}...${fp.btcPk.slice(-5)}`
            : "",
          "Total Delegation": `${totalDelegation} ${coinSymbol}`,
          Commission: `${commission}%`,
        } as Record<string, React.ReactNode>;

        const providerItemProps = {
          bsnId: fp.bsnId || fp.chain,
          bsnName: fp.chain,
          address: fp.btcPk,
          provider: {
            logo_url: fp.logo_url,
            rank: fp.rank,
            description: {
              moniker: fp.description?.moniker,
            },
          },
        };

        return (
          <TableElement
            key={fp.btcPk}
            providerItemProps={providerItemProps}
            attributes={attributes}
            isSelected={isSelected}
            isSelectable={isSelectable}
            onSelect={() => handleSelect(fp.btcPk)}
          />
        );
      })}
    </div>
  );
};
