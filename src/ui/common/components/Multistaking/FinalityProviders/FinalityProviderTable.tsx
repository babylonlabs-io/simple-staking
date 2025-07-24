/**
 * Import polyfill for array.toSorted
 */
import "core-js/features/array/to-sorted";

import { Button, Loader } from "@babylonlabs-io/core-ui";

import warningOctagon from "@/ui/common/assets/warning-octagon.svg";
import warningTriangle from "@/ui/common/assets/warning-triangle.svg";
import { FinalityProviderLogo } from "@/ui/common/components/Staking/FinalityProviders/FinalityProviderLogo";
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
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full h-[500px] overflow-scroll">
      {finalityProviders.map((fp) => {
        const isSelected = selectedFP === fp.btcPk;
        const isSelectable = isRowSelectable(fp);
        const totalDelegation = maxDecimals(
          satoshiToBtc(fp.activeTVLSat || 0),
          8,
        );
        const commission = maxDecimals((Number(fp.commission) || 0) * 100, 2);
        const status = FinalityProviderStateLabels[fp.state] || "Unknown";

        return (
          <div
            key={fp.btcPk}
            className={`bg-secondary-highlight h-[316px] overflow-hidden p-4 flex flex-col rounded justify-between`}
          >
            <div className="flex gap-2 items-center">
              <FinalityProviderLogo
                logoUrl={fp.logo_url}
                rank={fp.rank}
                moniker={fp.description?.moniker}
                className="w-10 h-10"
              />
              <div className="flex flex-col">
                <div className="text-xs text-accent-secondary">
                  {fp.btcPk
                    ? `${fp.btcPk.slice(0, 6)}...${fp.btcPk.slice(-6)}`
                    : ""}
                </div>
                <div className="text-base font-medium text-accent-primary">
                  {fp.description?.moniker || "Unnamed Provider"}
                </div>
              </div>
            </div>
            <div className="w-full h-px bg-secondary-strokeLight" />
            <div className="text-sm flex flex-row justify-between">
              <div className="text-accent-secondary">Status</div>
              <div className="text-accent-primary font-medium">{status}</div>
            </div>
            <div className="text-sm flex flex-row justify-between">
              <div className="text-accent-secondary">{coinSymbol} PK</div>
              <div className="text-accent-primary font-medium">
                {fp.btcPk
                  ? `${fp.btcPk.slice(0, 5)}...${fp.btcPk.slice(-5)}`
                  : ""}
              </div>
            </div>
            <div className="text-sm flex flex-row justify-between">
              <div className="text-accent-secondary">Total Delegation</div>
              <div className="text-accent-primary font-medium">
                {totalDelegation} {coinSymbol}
              </div>
            </div>
            <div className="text-sm flex flex-row justify-between">
              <div className="text-accent-secondary">Commission</div>
              <div className="text-accent-primary font-medium">
                {commission}%
              </div>
            </div>
            <Button
              className="mt-4"
              onClick={() => handleSelect(fp.btcPk)}
              disabled={!isSelectable}
              variant={isSelected ? "contained" : "outlined"}
            >
              {isSelected ? "Selected" : "Select"}
            </Button>
          </div>
        );
      })}
    </div>
  );
};
