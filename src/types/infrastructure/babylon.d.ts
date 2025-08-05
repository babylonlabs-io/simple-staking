// Babylon infrastructure typings – non-exhaustive but enough for current UI usage.
// NOTE: This file augments the types we import from @babylonlabs-io/babylon-proto-ts.
// If the upstream package publishes richer typings later, this file can be removed.

import type { LCDClient } from "@babylonlabs-io/babylon-proto-ts";

/** Babylon BABY-denominated utility helpers */
export interface BabylonUtils {
  /** Convert BABY (1e0) to ubbn (1e6) */
  babyToUbbn(value: number): bigint;
  /** Convert ubbn (1e6) to BABY (float) */
  ubbnToBaby(value: bigint): number;
}

/** Parameters shared by stake / unstake message builders */
export interface StakeMsgParams {
  validatorAddress: string;
  delegatorAddress: string;
  /** Amount in ubbn */
  amount: bigint;
}

export interface ClaimRewardMsgParams {
  validatorAddress: string;
  delegatorAddress: string;
}

export namespace BabylonTxs {
  namespace baby {
    function createStakeMsg(params: StakeMsgParams): unknown;
    function createUnstakeMsg(params: StakeMsgParams): unknown;
    function createClaimRewardMsg(params: ClaimRewardMsgParams): unknown;
  }
}

export interface BabylonSDK {
  client: LCDClient;
  txs: typeof BabylonTxs;
  utils: BabylonUtils;
}

declare module "@/infrastructure/babylon" {
  const sdk: BabylonSDK;
  export default sdk;
}
