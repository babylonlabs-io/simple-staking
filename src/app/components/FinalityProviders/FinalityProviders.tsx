import { FinalityProvider as FinalityProviderInterface, FinalityProviders as FinalityProvidersType } from "@/app/api/getFinalityProviders";
import { AiOutlineInfoCircle } from "react-icons/ai";

import { FinalityProvider } from "./FinalityProvider";
import InfiniteScroll from "react-infinite-scroll-component";

import { Tooltip } from "react-tooltip";
import { InfiniteQueryObserverResult } from "@tanstack/react-query";

interface FinalityProvidersProps {
  data: FinalityProviderInterface[] | undefined;
  totalActiveTVL?: number;
  next: () => Promise<InfiniteQueryObserverResult<FinalityProvidersType, Error>>;
  hasMore: boolean;
  isFetchingMore: boolean;
  isLoading: boolean;
}

export const FinalityProviders: React.FC<FinalityProvidersProps> = ({
  data,
  totalActiveTVL,
  next,
  hasMore,
  isFetchingMore,
  isLoading,
}) => {

  return (
    <div id="finality-providers" className="card flex flex-col gap-2 bg-base-300 p-4 shadow-sm lg:flex-1">
      <h3 className="mb-4 font-bold">Finality Providers</h3>
      {data && !isLoading && (
        <div className="hidden gap-2 px-4 text-sm lg:grid lg:grid-cols-finalityProviders ">
          <p>Finality Provider</p>
          <div className="flex items-center gap-1">
            <p>Delegations</p>
            <span
              className="cursor-pointer text-xs"
              data-tooltip-id="tooltip-delegations"
              data-tooltip-content="Delegations information"
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
      )}
      <div id="finality-providers" className="no-scrollbar max-h-[21rem] overflow-y-auto">
        <InfiniteScroll
          className="flex flex-col gap-4"
          dataLength={data?.length || 0}
          next={next}
          hasMore={hasMore}
          loader={isFetchingMore ? (
            <div className="w-full text-center">
              <span className="loading loading-spinner text-primary" />
            </div>
          ) : null
          }
          scrollableTarget="finality-providers"
        >
          {data ? (
            data.map((finalityProvider) => (
              <FinalityProvider
                key={finalityProvider.btc_pk}
                moniker={finalityProvider?.description?.moniker}
                pkHex={finalityProvider.btc_pk}
                delegations={finalityProvider.active_delegations}
                stake={finalityProvider.active_tvl}
                totalActiveTVL={totalActiveTVL}
              />
            ))
          ) : (
            <div className="flex justify-center py-4">
              <span className="loading loading-spinner text-primary" />
            </div>
          )}
        </InfiniteScroll>
      </div>
      <Tooltip id="tooltip-delegations" />
      <Tooltip id="tooltip-stake" />
    </div>
  );
};
