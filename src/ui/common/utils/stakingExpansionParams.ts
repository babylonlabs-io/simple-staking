import { BbnStakingParamsVersion } from "@/ui/common/types/networkInfo";

/**
 * Selects the appropriate staking parameters for expansion operations
 * based on the current BTC block height.
 *
 * This function selects the highest version that is currently active.
 *
 * @param versions - Array of all available parameter versions
 * @param currentBtcHeight - The current Bitcoin block height
 * @returns The appropriate parameters for the current height, or null if none are active
 */
export function selectParamsForCurrentHeight(
  versions: BbnStakingParamsVersion[],
  currentBtcHeight: number,
): BbnStakingParamsVersion | null {
  // Filter to only versions that are currently active (activation height <= current height)
  const activeVersions = versions.filter(
    (v) => v.btcActivationHeight <= currentBtcHeight,
  );

  if (activeVersions.length === 0) {
    return null;
  }

  // Return the highest version among active versions
  return activeVersions.reduce((prev, current) =>
    current.version > prev.version ? current : prev,
  );
}
