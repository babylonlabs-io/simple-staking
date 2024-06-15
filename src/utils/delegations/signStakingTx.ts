import { Transaction, networks } from "bitcoinjs-lib";
import { stakingTransaction } from "btc-staking-ts";

import { signPsbtTransaction } from "@/app/common/utils/psbt";
import { FinalityProvider } from "@/app/types/finalityProviders";
import { GlobalParamsVersion } from "@/app/types/globalParams";
import { apiDataToStakingScripts } from "@/utils/apiDataToStakingScripts";
import { isTaproot } from "@/utils/wallet";
import { UTXO, WalletProvider } from "@/utils/wallet/wallet_provider";

import { getStakingTerm } from "../getStakingTerm";

// Returns:
// - unsignedStakingPsbt: the unsigned staking transaction
// - stakingTerm: the staking term
// - stakingFee: the staking fee
export const createStakingTx = (
  globalParamsVersion: GlobalParamsVersion,
  stakingAmountSat: number,
  stakingTimeBlocks: number,
  finalityProvider: FinalityProvider,
  btcWalletNetwork: networks.Network,
  address: string,
  publicKeyNoCoord: string,
  feeRate: number,
  inputUTXOs: UTXO[],
) => {
  // Data extraction
  const stakingTerm = getStakingTerm(globalParamsVersion, stakingTimeBlocks);

  // Check the staking data
  if (
    stakingAmountSat < globalParamsVersion.minStakingAmountSat ||
    stakingAmountSat > globalParamsVersion.maxStakingAmountSat ||
    stakingTerm < globalParamsVersion.minStakingTimeBlocks ||
    stakingTerm > globalParamsVersion.maxStakingTimeBlocks
  ) {
    throw new Error("Invalid staking data");
  }

  if (inputUTXOs.length == 0) {
    throw new Error("Not enough usable balance");
  }

  // Create the staking scripts
  let scripts;
  try {
    scripts = apiDataToStakingScripts(
      finalityProvider.btcPk,
      stakingTerm,
      globalParamsVersion,
      publicKeyNoCoord,
    );
  } catch (error: Error | any) {
    throw new Error(error?.message || "Cannot build staking scripts");
  }

  // Create the staking transaction
  let unsignedStakingPsbt;
  let stakingFeeSat;
  try {
    const { psbt, fee } = stakingTransaction(
      scripts,
      stakingAmountSat,
      address,
      inputUTXOs,
      btcWalletNetwork,
      feeRate,
      isTaproot(address) ? Buffer.from(publicKeyNoCoord, "hex") : undefined,
      // `lockHeight` is exclusive of the provided value.
      // For example, if a Bitcoin height of X is provided,
      // the transaction will be included starting from height X+1.
      // https://learnmeabitcoin.com/technical/transaction/locktime/
      globalParamsVersion.activationHeight - 1,
    );
    unsignedStakingPsbt = psbt;
    stakingFeeSat = fee;
  } catch (error: Error | any) {
    throw new Error(
      error?.message || "Cannot build unsigned staking transaction",
    );
  }

  return { unsignedStakingPsbt, stakingTerm, stakingFeeSat };
};

// Sign a staking transaction
// Returns:
// - stakingTxHex: the signed staking transaction
// - stakingTerm: the staking term
export const signStakingTx = async (
  btcWallet: WalletProvider | undefined,
  globalParamsVersion: GlobalParamsVersion,
  stakingAmountSat: number,
  stakingTimeBlocks: number,
  finalityProvider: FinalityProvider | undefined,
  btcWalletNetwork: networks.Network | undefined,
  address: string | undefined,
  publicKeyNoCoord: string,
  feeRate: number,
  inputUTXOs: UTXO[],
): Promise<{ stakingTxHex: string; stakingTerm: number }> => {
  // Initial validation
  if (!btcWallet) throw new Error("Wallet is not connected");
  if (!address) throw new Error("Address is not set");
  if (!btcWalletNetwork) throw new Error("Wallet network is not connected");
  if (!finalityProvider) throw new Error("Finality provider is not selected");

  // Create the staking transaction
  let { unsignedStakingPsbt, stakingTerm } = createStakingTx(
    globalParamsVersion,
    stakingAmountSat,
    stakingTimeBlocks,
    finalityProvider,
    btcWalletNetwork,
    address,
    publicKeyNoCoord,
    feeRate,
    inputUTXOs,
  );

  // Sign the staking transaction
  let stakingTx: Transaction;
  try {
    stakingTx = await signPsbtTransaction(btcWallet)(
      unsignedStakingPsbt.toHex(),
    );
  } catch (error: Error | any) {
    throw new Error(error?.message || "Staking transaction signing PSBT error");
  }

  // Get the staking transaction hex
  const stakingTxHex = stakingTx.toHex();

  // Broadcast the staking transaction
  await btcWallet.pushTx(stakingTxHex);

  return { stakingTxHex, stakingTerm };
};
