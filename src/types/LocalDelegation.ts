import { State } from "./State";

export interface LocalDelegation {
  amount: number;
  duration: number;
  finalityProviderMoniker: string;
  stakingTx: string;
  stakingTxID: string;
  state: State;
  inception: number;
}
