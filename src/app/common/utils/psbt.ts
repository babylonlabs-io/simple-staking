import { Psbt, Transaction } from "bitcoinjs-lib";

import { BTCWalletProvider } from "@/utils/wallet/btc_wallet_provider";

const SIGN_PSBT_NOT_COMPATIBLE_WALLETS = ["OneKey"];

export type SignPsbtTransaction = (psbtHex: string) => Promise<Transaction>;

// This method is created to accommodate backward compatibility with the
// old implementation of signPsbt where the wallet.signPsbt method returns
// the signed transaction in hex
export const signPsbtTransaction = (
  signPsbt: BTCWalletProvider["signPsbt"],
  getWalletProviderName: BTCWalletProvider["getWalletProviderName"],
) => {
  return async (psbtHex: string) => {
    const signedHex = await signPsbt(psbtHex);
    const providerName = await getWalletProviderName();
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
