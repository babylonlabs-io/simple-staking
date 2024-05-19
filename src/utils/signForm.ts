import { Psbt, networks } from "bitcoinjs-lib";
import { stakingTransaction } from "btc-staking-ts";
import { GlobalParamsVersion } from "@/app/api/getGlobalParams";
import { FinalityProvider } from "@/app/api/getFinalityProviders";
import { WalletProvider } from "./wallet/wallet_provider";
import { apiDataToStakingScripts } from "./apiDataToStakingScripts";
import { isTaproot } from "./wallet";

export const signForm = async (
  params: GlobalParamsVersion,
  btcWallet: WalletProvider,
  finalityProvider: FinalityProvider,
  stakingTerm: number,
  btcWalletNetwork: networks.Network,
  stakingAmountSat: number,
  address: string,
  stakingFee: number,
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
    inputUTXOs = await btcWallet.getUtxos(
      address,
      stakingAmountSat + stakingFee,
    );
  } catch (error: Error | any) {
    throw new Error(error?.message || "UTXOs error");
  }
  if (inputUTXOs.length == 0) {
    throw new Error("Confirmed UTXOs not enough");
  }

  let scripts;
  try {
    scripts = apiDataToStakingScripts(
      finalityProvider.btc_pk,
      stakingTerm,
      params,
      publicKeyNoCoord,
    );
  } catch (error: Error | any) {
    throw new Error(error?.message || "Cannot build staking scripts");
  }

  const timelockScript = scripts.timelockScript;
  const dataEmbedScript = scripts.dataEmbedScript;
  const unbondingScript = scripts.unbondingScript;
  const slashingScript = scripts.slashingScript;
  let unsignedStakingTx;
  try {
    unsignedStakingTx = stakingTransaction(
      timelockScript,
      unbondingScript,
      slashingScript,
      stakingAmountSat,
      stakingFee,
      address,
      inputUTXOs,
      btcWalletNetwork,
      isTaproot(address) ? Buffer.from(publicKeyNoCoord, "hex") : undefined,
      dataEmbedScript,
    );
  } catch (error: Error | any) {
    throw new Error(
      error?.message || "Cannot build unsigned staking transaction",
    );
  }
  let stakingTx: string;
  try {
    const signedPsbt = await btcWallet.signPsbt(unsignedStakingTx.toHex());
    stakingTx = Psbt.fromHex(signedPsbt).extractTransaction().toHex();
  } catch (error: Error | any) {
    throw new Error(error?.message || "Staking transaction signing PSBT error");
  }

  return stakingTx;
};
