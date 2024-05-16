import { GlobalParamsVersion } from "@/app/api/getGlobalParams";
import { WalletProvider } from "./wallet/wallet_provider";
import { FinalityProvider } from "@/app/api/getFinalityProviders";
import { Psbt, networks } from "bitcoinjs-lib";
import { apiDataToStakingScripts } from "./apiDataToStakingScripts";
import { stakingTransaction } from "btc-staking-ts";
import { isTaproot } from "./wallet";

export const signForm = async (
    params: GlobalParamsVersion | undefined,
    btcWallet: WalletProvider | undefined,
    finalityProvidersData: FinalityProvider[] | undefined,
    finalityProvider: FinalityProvider | undefined,
    term: number,
    btcWalletNetwork: networks.Network | undefined,
    amount: number,
    address: string,
    stakingFee: number,
    publicKeyNoCoord: string,
): Promise<string> => {
    const walletAndDataReady =
        !!btcWallet && !!params && !!finalityProvidersData && !!btcWalletNetwork

    if (!walletAndDataReady) {
        throw new Error("Wallet or data or wallet network not ready");
    }

    // check if term is fixed
    let termWithFixed;
    if (
        params &&
        params.minStakingTime ===
        params.maxStakingTime
    ) {
        // if term is fixed, use the API value
        termWithFixed = params.minStakingTime;
    } else {
        // if term is not fixed, use the term from the input
        termWithFixed = term;
    }

    if (
        !finalityProvider ||
        amount * 1e8 < params.minStakingAmount ||
        amount * 1e8 > params.maxStakingAmount ||
        termWithFixed < params.minStakingTime ||
        termWithFixed > params.maxStakingTime
    ) {
        // TODO Show Popup
        throw new Error("Invalid staking data");
    }

    // Rounding the input since 0.0006 * 1e8 is is 59999.999
    // which won't be accepted by the mempool API
    const stakingAmount = Math.round(Number(amount) * 1e8);
    const stakingTerm = Number(termWithFixed);
    let inputUTXOs = [];
    try {
        inputUTXOs = await btcWallet.getUtxos(
            address,
            stakingAmount + stakingFee,
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
            stakingAmount,
            stakingFee,
            address,
            inputUTXOs,
            btcWalletNetwork,
            isTaproot(address) ? Buffer.from(publicKeyNoCoord, "hex") : undefined,
            dataEmbedScript,
        );
    } catch (error: Error | any) {
        throw new Error(error?.message || "Cannot build unsigned staking transaction");
    }
    let stakingTx: string;
    try {
        const signedPsbt = await btcWallet.signPsbt(unsignedStakingTx.toHex());
        stakingTx = Psbt.fromHex(signedPsbt).extractTransaction().toHex();
    } catch (error: Error | any) {
        throw new Error(error?.message || "Staking transaction signing PSBT error");
    }

    return stakingTx;
}