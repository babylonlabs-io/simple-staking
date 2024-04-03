import { LocalDelegation } from "@/types/LocalDelegation";
import { State } from "@/types/State";

export const toLocalDelegation = (
  amount: number,
  duration: number,
  finalityProviderMoniker: string,
  stakingTx: string,
  stakingTxID: string,
  state: State,
  inception: number,
): LocalDelegation => ({
  amount,
  duration,
  finalityProviderMoniker,
  stakingTx,
  stakingTxID,
  state,
  inception,
});
