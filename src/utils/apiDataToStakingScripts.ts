import { StakingScriptData, StakingScripts } from "btc-staking-ts";

import { GlobalParamsData } from "@/app/api/getGlobalParams";
import { getPublicKeyNoCoord } from "@/utils/wallet/index";

// Used to recreate scripts from the data received from the API
export const apiDataToStakingScripts = (
  finalityProviderPkHex: string,
  stakingTxTimelock: number,
  globalParams: GlobalParamsData,
  publicKeyNoCoord: string,
): StakingScripts => {
  if (!globalParams || !publicKeyNoCoord) {
    throw new Error("Invalid data");
  }

  // Convert covenant PKs to buffers
  const covenantPKsBuffer = globalParams?.covenant_pks?.map((pk) =>
    getPublicKeyNoCoord(pk)
  );

  // Create staking script data
  let stakingScriptData;
  try {
    stakingScriptData = new StakingScriptData(
      Buffer.from(publicKeyNoCoord, "hex"),
      [Buffer.from(finalityProviderPkHex, "hex")],
      covenantPKsBuffer,
      globalParams.covenant_quorum,
      stakingTxTimelock,
      globalParams.unbonding_time,
      Buffer.from(globalParams.tag),
    );
  } catch (error: Error | any) {
    throw new Error(error?.message || "Cannot build staking script data");
  }

  // Build scripts
  let scripts;
  try {
    scripts = stakingScriptData.buildScripts();
  } catch (error: Error | any) {
    throw new Error(error?.message || "Error while recreating scripts");
  }

  return scripts;
};
