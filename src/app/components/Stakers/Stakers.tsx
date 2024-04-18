import { useInfiniteQuery } from "@tanstack/react-query";

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
      <div className="hidden grid-cols-3 gap-2 px-4 lg:grid">
        <p>Staker</p>
        <p>Delegations</p>
        <p>Stake</p>
      </div>
      <div className="no-scrollbar flex max-h-[21rem] flex-col gap-4 overflow-y-auto">
        {stakersData?.map((staker) => (
          <Staker
            key={staker.staker_pk_hex}
            pkHex={staker.staker_pk_hex}
            delegations={staker.active_delegations}
            stake={staker.active_tvl}
          />
        ))}
      </div>
    </div>
  );
};
