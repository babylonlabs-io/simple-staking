import { AiOutlineInfoCircle } from "react-icons/ai";
import InfiniteScroll from "react-infinite-scroll-component";
import { Tooltip } from "react-tooltip";

import { FinalityProvider } from "./FinalityProvider";
import { FinalityProvider as FinalityProviderInterface } from "@/app/types/finalityProviders";
import {
  LoadingTableList,
  LoadingView,
} from "@/app/components/Loading/Loading";
import { QueryMeta } from "@/app/types/api";

interface FinalityProvidersProps {
  data: FinalityProviderInterface[] | undefined;
  totalActiveTVLSat?: number;
  queryMeta: QueryMeta;
}

export const FinalityProviders: React.FC<FinalityProvidersProps> = ({
  data,
  totalActiveTVLSat,
  queryMeta,
}) => {
  if (!data || data.length === 0) {
    return <LoadingView />;
  }

  return (
    <div className="card flex flex-col gap-2 bg-base-300 p-4 shadow-sm lg:flex-1">
      <h3 className="mb-4 font-bold">Finality Providers</h3>
      <div className="hidden gap-2 px-4 text-sm lg:grid lg:grid-cols-finalityProviders ">
        <p>Finality Provider</p>
        <div className="flex items-center gap-1">
          <p>Delegations</p>
          <span
            className="cursor-pointer text-xs"
            data-tooltip-id="tooltip-delegations"
            data-tooltip-content="Total number of stake delegations"
            data-tooltip-place="top"
          >
            <AiOutlineInfoCircle />
          </span>
        </div>
        <div className="flex items-center gap-1">
          <p>Stake</p>
          <span
            className="cursor-pointer text-xs"
            data-tooltip-id="tooltip-stake"
            data-tooltip-content="Stake information"
            data-tooltip-place="top"
          >
            <AiOutlineInfoCircle />
          </span>
        </div>
      </div>
      <div
        id="finality-providers"
        className="no-scrollbar max-h-[21rem] overflow-y-auto"
      >
        <InfiniteScroll
          className="flex flex-col gap-4"
          dataLength={data?.length || 0}
          next={queryMeta.next}
          hasMore={queryMeta.hasMore}
          loader={queryMeta.isFetchingMore ? <LoadingTableList /> : null}
          scrollableTarget="finality-providers"
        >
          {data ? (
            data.map((finalityProvider) => (
              <FinalityProvider
                key={finalityProvider.btcPk}
                moniker={finalityProvider?.description?.moniker}
                pkHex={finalityProvider.btcPk}
                delegations={finalityProvider.activeDelegations}
                stakeSat={finalityProvider.activeTVLSat}
                totalActiveTVLSat={totalActiveTVLSat}
              />
            ))
          ) : (
            <LoadingView />
          )}
        </InfiniteScroll>
      </div>
      <Tooltip id="tooltip-delegations" />
      <Tooltip id="tooltip-stake" />
    </div>
  );
};
