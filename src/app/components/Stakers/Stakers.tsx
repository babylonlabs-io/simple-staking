import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { AiOutlineInfoCircle } from "react-icons/ai";
import { Tooltip } from "react-tooltip";

import { getStakers } from "@/app/api/getStakers";
import { LoadingView } from "@/app/components/Loading/Loading";
import { useError } from "@/app/context/Error/ErrorContext";
import { ErrorState } from "@/app/types/errors";

import { Staker } from "./Staker";

interface StakersProps {}

export const Stakers: React.FC<StakersProps> = () => {
  const { showError, hideError, isErrorOpen } = useError();

  const {
    data: stakersData,
    error,
    refetch,
  } = useQuery({
    queryKey: ["stakers"],
    queryFn: getStakers,
    refetchInterval: 60000, // 1 minute
    select: (data) => data.stakers,
    retry: (failureCount, error) => {
      return !isErrorOpen && failureCount <= 3;
    },
  });

  useEffect(() => {
    if (error) {
      showError({
        error: {
          message: error.message,
          errorState: ErrorState.SERVER_ERROR,
          errorTime: new Date(),
        },
        retryAction: refetch,
      });
    }
  }, [error, refetch, showError, hideError]);

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
      )}
      <div className="no-scrollbar flex max-h-[21rem] flex-col gap-4 overflow-y-auto">
        {stakersData ? (
          stakersData.map(
            (staker) =>
              staker && (
                <Staker
                  key={staker.staker_pk_hex}
                  pkHex={staker.staker_pk_hex}
                  delegations={staker.active_delegations}
                  activeTVLSat={staker.active_tvl}
                />
              ),
          )
        ) : (
          <LoadingView />
        )}
      </div>
      <Tooltip id="tooltip-delegations" />
      <Tooltip id="tooltip-stake" />
    </div>
  );
};
