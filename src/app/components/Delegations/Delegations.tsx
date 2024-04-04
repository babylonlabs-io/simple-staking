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
          // Convert the start timestamp to a human readable format
          const startTimestamp = new Date(
            staking_tx?.start_timestamp,
          )?.toLocaleDateString();
          // startHeight differentiates the local storage items
          const startHeight = staking_tx?.start_height;
          if (
            finalityProviderMoniker &&
            staking_tx &&
            staking_value &&
            staking_tx_hash_hex &&
            staking_tx?.timelock &&
            readableState &&
            startTimestamp
          ) {
            return (
              <Delegation
                key={staking_tx_hash_hex + startHeight}
                finalityProviderMoniker={finalityProviderMoniker}
                stakingTx={staking_tx}
                stakingValue={staking_value}
                timelock={staking_tx?.timelock}
                stakingTxID={staking_tx_hash_hex}
                state={readableState}
                startTimestamp={startTimestamp}
                startHeight={startHeight}
              />
            );
          }
        })}
      </div>
    </div>
  );
};
