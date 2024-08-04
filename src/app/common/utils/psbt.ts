import { Psbt, Transaction } from "bitcoinjs-lib";

import { WalletProvider } from "@/utils/wallet/wallet_provider";

const SIGN_PSBT_NOT_COMPATIBLE_WALLETS = ["OneKey"];

export type SignPsbtTransaction = (psbtHex: string) => Promise<Transaction>;

// This method is created to accommodate backward compatibility with the
// old implementation of signPsbt where the wallet.signPsbt method returns
// the signed transaction in hex
export const signPsbtTransaction = (wallet: WalletProvider) => {
  return async (psbtHex: string) => {
    console.log("inside return async");
    const signedHex = await wallet.signPsbt(psbtHex);
    console.log("signedHex", signedHex);
    const providerName = await wallet.getWalletProviderName();
    console.log("providerName", providerName);
    if (SIGN_PSBT_NOT_COMPATIBLE_WALLETS.includes(providerName)) {
      try {
        console.log("1");
        // Try to parse the signedHex as PSBT to see if it follows the new implementation
        return Psbt.fromHex(signedHex).extractTransaction();
      } catch {
        console.log("2");
        // If parsing fails, it's the old version implementation
        return Transaction.fromHex(signedHex);
      }
    }

    console.log("3");
    // For compatible wallets, directly extract the transaction from the signed PSBT
    return Psbt.fromHex(signedHex).extractTransaction();
  };
};
