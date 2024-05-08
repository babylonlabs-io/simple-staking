import { useInfiniteQuery } from "@tanstack/react-query";
import { AiOutlineInfoCircle } from "react-icons/ai";
import { Tooltip } from "react-tooltip";

import { getStakers } from "@/app/api/getStakers";
import { Staker } from "./Staker";

interface StakersProps {}

export const Stakers: React.FC<StakersProps> = () => {
  const { data: stakersData, fetchNextPage: _fetchNextStakersPage } =
    useInfiniteQuery({
      queryKey: ["stakers"],
      queryFn: ({ pageParam = "" }) => getStakers(pageParam),
      getNextPageParam: (lastPage) => lastPage?.pagination?.next_key,
      initialPageParam: "",
      refetchInterval: 60000, // 1 minute
      select: (data) => data?.pages?.flatMap((page) => page?.data),
    });

  return (
    <div className="card flex flex-col gap-2 bg-base-300 p-4 shadow-sm lg:flex-1">
      <h3 className="mb-4 font-bold">Top Stakers</h3>
      {stakersData && (
        <div className="hidden grid-cols-3 gap-2 px-4 text-sm lg:grid">
          <p>Staker</p>
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
      <div className="no-scrollbar flex max-h-[21rem] flex-col gap-4 overflow-y-auto">
        {stakersData ? (
          stakersData.map(
            (staker) =>
              // TODO handle API data errors with a proper error boundary
              staker && (
                <Staker
                  key={staker.staker_pk_hex}
                  pkHex={staker.staker_pk_hex}
                  delegations={staker.active_delegations}
                  activeTVL={staker.active_tvl}
                />
              ),
          )
        ) : (
          <div className="flex justify-center py-4">
            <span className="loading loading-spinner text-primary" />
          </div>
        )}
      </div>
      <Tooltip id="tooltip-delegations" />
      <Tooltip id="tooltip-stake" />
    </div>
  );
};
