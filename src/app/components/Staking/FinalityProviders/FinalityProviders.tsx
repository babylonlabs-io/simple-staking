import InfiniteScroll from "react-infinite-scroll-component";

import {
  LoadingTableList,
  LoadingView,
} from "@/app/components/Loading/Loading";
import { useFinalityProvidersData } from "@/app/hooks/finalityProviders/useFinalityProvidersData";
import { FinalityProvidersProps } from "@/app/types/finalityProviders";
import { getNetworkConfig } from "@/config/network.config";
import { Network } from "@/utils/wallet/wallet_provider";

import { FinalityProvider } from "./FinalityProvider";
import { FinalityProviderSearch } from "./FinalityProviderSearch";

export const FinalityProviders: React.FC<FinalityProvidersProps> = ({
  finalityProviders,
  selectedFinalityProvider,
  onFinalityProviderChange,
  queryMeta,
}) => {
  const { handleSearch, filteredProviders } =
    useFinalityProvidersData(finalityProviders);

  if (!finalityProviders || finalityProviders.length === 0) {
    return <LoadingView />;
  }

  const network = getNetworkConfig().network;
  const createFinalityProviderLink = `https://github.com/babylonlabs-io/networks/tree/main/${
    network == Network.MAINNET ? "bbn-1" : "bbn-test-4"
  }/finality-providers`;

  return (
    <>
      <p>
        Select a finality provider or{" "}
        <a
          href={createFinalityProviderLink}
          target="_blank"
          rel="noopener noreferrer"
          className="sublink text-primary hover:underline"
        >
          create your own
        </a>
        .
      </p>
      <div className="flex gap-3">
        <FinalityProviderSearch onSearch={handleSearch} />
      </div>
      <div className="hidden gap-2 px-4 lg:grid lg:grid-cols-stakingFinalityProvidersDesktop">
        <p>Finality Provider</p>
        <p>BTC PK</p>
        <p>Total Delegation</p>
        <p>Commission</p>
      </div>
      <div
        id="finality-providers"
        className="no-scrollbar max-h-[21rem] overflow-y-auto"
      >
        <InfiniteScroll
          className="flex flex-col gap-4"
          dataLength={filteredProviders?.length || 0}
          next={queryMeta.next}
          hasMore={queryMeta.hasMore}
          loader={queryMeta.isFetchingMore ? <LoadingTableList /> : null}
          scrollableTarget="finality-providers"
        >
          {filteredProviders?.map((fp) => (
            <FinalityProvider
              key={fp.btcPk}
              moniker={fp.description?.moniker}
              website={fp.description?.website}
              pkHex={fp.btcPk}
              stakeSat={fp.activeTVLSat}
              commission={fp.commission}
              selected={selectedFinalityProvider?.btcPk === fp.btcPk}
              onClick={() => {
                onFinalityProviderChange(fp.btcPk);
              }}
            />
          ))}
        </InfiniteScroll>
      </div>
    </>
  );
};
