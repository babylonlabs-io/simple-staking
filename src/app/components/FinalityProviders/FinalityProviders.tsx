import { FinalityProvider as FinalityProviderInterface } from "@/app/api/getFinalityProviders";
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
        <div className="hidden gap-2 px-4 lg:grid lg:grid-cols-finalityProviders">
          <p>Finality Provider</p>
          <p>Delegations</p>
          <p>Stake</p>
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
    </div>
  );
};
