import { Transaction, networks } from "bitcoinjs-lib";
import { unbondingTransaction } from "btc-staking-ts";

import { getGlobalParams } from "@/app/api/getGlobalParams";
import { getUnbondingEligibility } from "@/app/api/getUnbondingEligibility";
import { postUnbonding } from "@/app/api/postUnbonding";
import { SignPsbtTransaction } from "@/app/common/utils/psbt";
import { Delegation as DelegationInterface } from "@/app/types/delegations";
import { apiDataToStakingScripts } from "@/utils/apiDataToStakingScripts";
import { getCurrentGlobalParamsVersion } from "@/utils/globalParams";

// Get the staker signature from the unbonding transaction
const getStakerSignature = (unbondingTx: Transaction): string => {
  try {
    return unbondingTx.ins[0].witness[0].toString("hex");
  } catch (error) {
    throw new Error("Failed to get staker signature");
  }
};

// Sign an unbonding transaction
// Returns:
// - unbondingTx: the signed unbonding transaction
// - delegation: the initial delegation
export const signUnbondingTx = async (
  id: string,
  delegationsAPI: DelegationInterface[],
  publicKeyNoCoord: string,
  btcWalletNetwork: networks.Network,
  signPsbtTx: SignPsbtTransaction,
): Promise<{ unbondingTxHex: string; delegation: DelegationInterface }> => {
  // Check if the data is available
  if (!delegationsAPI) {
    throw new Error("No back-end API data available");
  }

  // Find the delegation in the delegations retrieved from the API
  const delegation = delegationsAPI.find(
    (delegation) => delegation.stakingTxHashHex === id,
  );
  if (!delegation) {
    throw new Error("Delegation not found");
  }

  // Check if the unbonding is possible
  const unbondingEligibility = await getUnbondingEligibility(
    delegation.stakingTxHashHex,
  );
  if (!unbondingEligibility) {
    throw new Error("Not eligible for unbonding");
  }

  const paramVersions = await getGlobalParams();
  // State of global params when the staking transaction was submitted
  const { currentVersion: globalParamsWhenStaking } =
    getCurrentGlobalParamsVersion(
      delegation.stakingTx.startHeight,
      paramVersions,
    );

  if (!globalParamsWhenStaking) {
    throw new Error("Current version not found");
  }

  // Recreate the staking scripts
  const scripts = apiDataToStakingScripts(
    delegation.finalityProviderPkHex,
    delegation.stakingTx.timelock,
    globalParamsWhenStaking,
    publicKeyNoCoord,
  );

  // Create the unbonding transaction
  const { psbt: unsignedUnbondingTx } = unbondingTransaction(
    scripts,
    Transaction.fromHex(delegation.stakingTx.txHex),
    globalParamsWhenStaking.unbondingFeeSat,
    btcWalletNetwork,
    delegation.stakingTx.outputIndex,
  );

  // Sign the unbonding transaction
  let unbondingTx: Transaction;
  try {
    unbondingTx = await signPsbtTx(unsignedUnbondingTx.toHex());
  } catch (error) {
    throw new Error("Failed to sign PSBT for the unbonding transaction");
  }

  // Get the staker signature
  const stakerSignature = getStakerSignature(unbondingTx);

  // Get the unbonding transaction hex
  const unbondingTxHex = unbondingTx.toHex();

  // POST unbonding to the API
  await postUnbonding(
    stakerSignature,
    delegation.stakingTxHashHex,
    unbondingTx.getId(),
    unbondingTxHex,
  );

  return { unbondingTxHex, delegation };
};
