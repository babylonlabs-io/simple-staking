import { Delegation as DelegationInterface } from "@/app/api/getDelegations";
import { Delegation } from "./Delegation";
import { getState } from "@/utils/getState";

interface DelegationsProps {
  data: DelegationInterface[];
  finalityProvidersKV: Record<string, string>;
}

export const Delegations: React.FC<DelegationsProps> = ({
  data,
  finalityProvidersKV,
}) => {
  return (
    <div className="card gap-4 bg-base-300 p-4">
      <div className="flex w-full">
        <h2 className="font-bold">Staking history</h2>
      </div>
      <div className="grid w-full grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-4">
        {data?.map((delegation) => {
          const { staking_value, staking_tx, staking_tx_hash_hex } = delegation;
          const finalityProviderMoniker =
            finalityProvidersKV[delegation?.finality_provider_pk_hex];
          const stakingTxID = delegation?.staking_tx_hash_hex;
          const state = getState(delegation?.state);
          const startTimestamp = new Date(
            staking_tx?.start_timestamp,
          ).toLocaleDateString();
          const startHeight = staking_tx?.start_height;
          if (
            finalityProviderMoniker &&
            staking_tx &&
            staking_value &&
            staking_tx_hash_hex &&
            staking_tx?.timelock &&
            stakingTxID &&
            state &&
            startTimestamp
          ) {
            return (
              <Delegation
                key={staking_tx_hash_hex + startHeight}
                finalityProviderMoniker={finalityProviderMoniker}
                stakingTx={staking_tx}
                stakingValue={staking_value}
                timelock={staking_tx?.timelock}
                stakingTxID={stakingTxID}
                state={state}
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
