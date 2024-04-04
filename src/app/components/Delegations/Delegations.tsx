import { Delegation as DelegationInterface } from "@/app/api/getDelegations";
import { Delegation } from "./Delegation";
import { getState } from "@/utils/getState";

interface DelegationsProps {
  delegations: DelegationInterface[];
  finalityProvidersKV: Record<string, string>;
}

export const Delegations: React.FC<DelegationsProps> = ({
  delegations,
  finalityProvidersKV,
}) => {
  return (
    <div className="card gap-4 bg-base-300 p-4">
      <div className="flex w-full">
        <h2 className="font-bold">Staking history</h2>
      </div>
      <div className="grid w-full grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-4">
        {delegations?.map((delegation) => {
          if (!delegation) return null;

          const {
            staking_value,
            staking_tx,
            staking_tx_hash_hex,
            finality_provider_pk_hex,
            state,
          } = delegation;
          // Get the moniker of the finality provider
          const finalityProviderMoniker =
            finalityProvidersKV[finality_provider_pk_hex];
          // Convert state to human readable format
          const readableState = getState(state);

          return (
            <Delegation
              key={staking_tx_hash_hex}
              finalityProviderMoniker={finalityProviderMoniker}
              stakingTx={staking_tx}
              stakingValue={staking_value}
              stakingTxID={staking_tx_hash_hex}
              state={readableState}
            />
          );
        })}
      </div>
    </div>
  );
};
