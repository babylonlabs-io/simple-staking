import { Transaction, networks } from "bitcoinjs-lib";
import { stakingTransaction } from "btc-staking-ts";
import { GlobalParamsVersion } from "@/app/types/globalParams";
import { FinalityProvider } from "@/app/types/finalityProviders";
import { WalletProvider } from "./wallet/wallet_provider";
import { apiDataToStakingScripts } from "./apiDataToStakingScripts";
import { isTaproot } from "./wallet";
import { signPsbtTransaction } from "@/app/common/utils/psbt";

export const signForm = async (
  params: GlobalParamsVersion,
  btcWallet: WalletProvider,
  finalityProvider: FinalityProvider,
  stakingTerm: number,
  btcWalletNetwork: networks.Network,
  stakingAmountSat: number,
  address: string,
  publicKeyNoCoord: string,
): Promise<string> => {
  if (
    !finalityProvider ||
    stakingAmountSat < params.minStakingAmountSat ||
    stakingAmountSat > params.maxStakingAmountSat ||
    stakingTerm < params.minStakingTimeBlocks ||
    stakingTerm > params.maxStakingTimeBlocks
  ) {
    // TODO Show Popup
    throw new Error("Invalid staking data");
  }

  let inputUTXOs = [];
  try {
    inputUTXOs = await btcWallet.getUtxos(address);
  } catch (error: Error | any) {
    throw new Error(error?.message || "UTXOs error");
  }
  if (inputUTXOs.length == 0) {
    throw new Error("Confirmed UTXOs not enough");
  }

  let scripts;
  try {
    scripts = apiDataToStakingScripts(
      finalityProvider.btcPk,
      stakingTerm,
      params,
      publicKeyNoCoord,
    );
  } catch (error: Error | any) {
    throw new Error(error?.message || "Cannot build staking scripts");
  }
  let feeRate: number;
  try {
    const netWorkFee = await btcWallet.getNetworkFees();
    feeRate = netWorkFee.fastestFee;
  } catch (error) {
    throw new Error("Cannot get network fees");
  }
  let unsignedPsbt;
  try {
    const { psbt } = stakingTransaction(
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
      params.activationHeight - 1,
    );
    unsignedPsbt = psbt;
  } catch (error: Error | any) {
    throw new Error(
      error?.message || "Cannot build unsigned staking transaction",
    );
  }
  let stakingTx: Transaction;
  try {
    stakingTx = await signPsbtTransaction(btcWallet)(unsignedPsbt.toHex());
  } catch (error: Error | any) {
    throw new Error(error?.message || "Staking transaction signing PSBT error");
  }

  return stakingTx.toHex();
};
