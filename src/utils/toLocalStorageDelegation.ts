import { LocalStorageDelegation } from "@/types/LocalStorageDelegation";
import { State } from "@/types/State";

export const toLocalStorageDelegation = (
  amount: number,
  duration: number,
  finalityProviderMoniker: string,
  stakingTx: string,
  stakingTxID: string,
  state: State,
  inception: number,
): LocalStorageDelegation => ({
  amount,
  duration,
  finalityProviderMoniker,
  stakingTx,
  stakingTxID,
  state,
  inception,
});
