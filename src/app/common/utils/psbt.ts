import { Psbt, Transaction } from "bitcoinjs-lib";

import { WalletProvider } from "@/utils/wallet/wallet_provider";

const SIGN_PSBT_NOT_COMPATIBLE_WALLETS = ["OneKey"];

export type SignPsbtTransaction = (psbtHex: string) => Promise<Transaction>;

// This method is created to accommodate backward compatibility with the
// old implementation of signPsbt where the wallet.signPsbt method returns
// the signed transaction in hex
export const signPsbtTransaction = (wallet: WalletProvider) => {
  return async (psbtHex: string) => {
    const signedHex = await wallet.signPsbt(psbtHex);
    const providerName = await wallet.getWalletProviderName();
    if (SIGN_PSBT_NOT_COMPATIBLE_WALLETS.includes(providerName)) {
      // The old implementation of signPsbt returns the signed transaction in hex
      return Transaction.fromHex(signedHex);
    }
    // The new implementation of signPsbt returns the signed PSBT in hex
    // We need to extract the transaction from the PSBT
    return Psbt.fromHex(signedHex).extractTransaction();
  };
};
