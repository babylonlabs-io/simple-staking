import { FinalityProvider as FinalityProviderInterface } from "@/app/api/getFinalityProviders";
import { AiOutlineInfoCircle } from "react-icons/ai";
import { Tooltip } from "react-tooltip";

import { FinalityProvider } from "./FinalityProvider";

interface FinalityProvidersProps {
  data: FinalityProviderInterface[] | undefined;
  totalActiveTVL?: number;
}

export const FinalityProviders: React.FC<FinalityProvidersProps> = ({
  data,
  totalActiveTVL,
}) => {
  return (
    <div className="card flex flex-col gap-2 bg-base-300 p-4 shadow-sm lg:flex-1">
      <h3 className="mb-4 font-bold">Finality Providers</h3>
      {data && (
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
      )}
      <div className="no-scrollbar flex max-h-[21rem] flex-col gap-4 overflow-y-auto">
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
      </div>
      <Tooltip id="tooltip-delegations" />
      <Tooltip id="tooltip-stake" />
    </div>
  );
};
