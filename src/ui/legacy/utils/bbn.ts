import { QueryDelegationTotalRewardsResponse } from "cosmjs-types/cosmos/distribution/v1beta1/query";

/**
 * Converts BABY to uBBN (micro BABY).
 * should be used internally in the app
 * @param bbn The amount in BABY.
 * @returns The equivalent amount in uBBN.
 */
export function babyToUbbn(bbn: number): number {
  return Math.round(bbn * 1e6);
}

/**
 * Converts uBBN (micro BABY) to BABY.
 * should be used only in the UI
 * @param ubbn The amount in uBBN.
 * @returns The equivalent amount in BABY.
 */
export function ubbnToBaby(ubbn: number): number {
  return ubbn / 1e6;
}

/**
 * Normalizes CosmJS amount from 18-decimal precision to standard ubbn format.
 * CosmJS returns amounts with 18 decimal places, but standard ubbn format uses fewer decimals.
 * @param amount The amount string from CosmJS (with 18 decimal precision).
 * @returns The normalized amount as a string in standard ubbn format.
 */
export function normalizeCosmjsAmount(amount: string): string {
  const numAmount = parseFloat(amount);
  return (numAmount / 1e18).toString();
}

/**
 * Normalizes reward response from CosmJS to standard ubbn format.
 * Applies amount normalization to all coin amounts in the reward structure.
 * @param response The QueryDelegationTotalRewardsResponse from CosmJS.
 * @returns The normalized reward array with amounts in standard ubbn format.
 */
export function normalizeRewardResponse(
  response: QueryDelegationTotalRewardsResponse,
) {
  return response.rewards?.map((reward) => ({
    ...reward,
    reward: reward.reward?.map((coin) => ({
      ...coin,
      amount: normalizeCosmjsAmount(coin.amount),
    })),
  }));
}
