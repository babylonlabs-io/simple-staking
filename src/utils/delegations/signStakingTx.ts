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
export const createStakingTx = async (
  btcWallet: WalletProvider,
  address: string,
  btcWalletNetwork: networks.Network,
  finalityProvider: FinalityProvider,
  globalParamsVersion: GlobalParamsVersion,
  stakingTimeBlocks: number,
  stakingAmountSat: number,
  publicKeyNoCoord: string,
  predefinedFeeRate?: number,
  predefinedUTXOs?: UTXO[],
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

  let inputUTXOs = [];
  try {
    // If predefined UTXOs are provided (fees calculations), use them
    if (predefinedUTXOs) {
      inputUTXOs = predefinedUTXOs;
    } else {
      // If not, get the UTXOs from the wallet
      inputUTXOs = await btcWallet.getUtxos(address);
    }
  } catch (error: Error | any) {
    throw new Error(error?.message || "UTXOs error");
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

  // Get the network fees
  let feeRate: number;
  try {
    // If predefined fee rate is provided, use it
    if (predefinedFeeRate) {
      feeRate = predefinedFeeRate;
    } else {
      // If not, get the network fastest fee
      const netWorkFee = await btcWallet.getNetworkFees();
      feeRate = netWorkFee.fastestFee;
    }
  } catch (error) {
    throw new Error("Cannot get network fees");
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
  globalParamsVersion: GlobalParamsVersion,
  stakingTimeBlocks: number,
  btcWallet: WalletProvider | undefined,
  finalityProvider: FinalityProvider | undefined,
  btcWalletNetwork: networks.Network | undefined,
  stakingAmountSat: number,
  address: string | undefined,
  publicKeyNoCoord: string,
  customFeeRate?: number,
): Promise<{ stakingTxHex: string; stakingTerm: number }> => {
  // Initial validation
  if (!btcWallet) throw new Error("Wallet is not connected");
  if (!address) throw new Error("Address is not set");
  if (!btcWalletNetwork) throw new Error("Wallet network is not connected");
  if (!finalityProvider) throw new Error("Finality provider is not selected");

  // Create the staking transaction
  let { unsignedStakingPsbt, stakingTerm } = await createStakingTx(
    btcWallet,
    address,
    btcWalletNetwork,
    finalityProvider,
    globalParamsVersion,
    stakingTimeBlocks,
    stakingAmountSat,
    publicKeyNoCoord,
    customFeeRate,
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
