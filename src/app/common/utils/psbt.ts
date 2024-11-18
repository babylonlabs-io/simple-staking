import { Psbt, Transaction } from "bitcoinjs-lib";

import { WalletProvider } from "@/utils/wallet/wallet_provider";

const SIGN_PSBT_NOT_COMPATIBLE_WALLETS = ["OneKey"];

// wallets requiring to disable the tweakSigner option
const SIGN_PSBT_DISABLE_TWEAK_SIGNER = ["OKX"];

export type signPsbtMode = "staking" | "unbonding" | "withdrawal";

export type SignPsbtTransaction = (
  psbtHex: string,
  signPsbtMode: signPsbtMode,
) => Promise<Transaction>;

// This method is created to accommodate backward compatibility with the
// old implementation of signPsbt where the wallet.signPsbt method returns
// the signed transaction in hex
export const signPsbtTransaction = (wallet: WalletProvider) => {
  return async (psbtHex: string, mode: signPsbtMode) => {
    let shouldDisableTweakSigner = false;

    if (
      (mode === "unbonding" || mode === "withdrawal") &&
      SIGN_PSBT_DISABLE_TWEAK_SIGNER.includes(
        await wallet.getWalletProviderName(),
      )
    ) {
      shouldDisableTweakSigner = true;
    }

    const signedHex = await wallet.signPsbt(psbtHex, {
      disableTweakSigner: shouldDisableTweakSigner,
    });
    const providerName = await wallet.getWalletProviderName();
    if (SIGN_PSBT_NOT_COMPATIBLE_WALLETS.includes(providerName)) {
      try {
        // Try to parse the signedHex as PSBT to see if it follows the new implementation
        return Psbt.fromHex(signedHex).extractTransaction();
      } catch {
        // If parsing fails, it's the old version implementation
        return Transaction.fromHex(signedHex);
      }
    }

    // For compatible wallets, directly extract the transaction from the signed PSBT
    return Psbt.fromHex(signedHex).extractTransaction();
  };
};
