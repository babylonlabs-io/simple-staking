import { Psbt, Transaction } from "bitcoinjs-lib";

import { WalletProvider } from "@/utils/wallet/wallet_provider";

export type SignPsbtTransaction = (psbtHex: string) => Promise<Transaction>;

// This method is created to accommodate backward compatibility with the
// old implementation of signPsbt where the wallet.signPsbt method returns
// the signed transaction in hex
export const signPsbtTransaction = (wallet: WalletProvider) => {
  return async (psbtHex: string) => {
    const signedHex = await wallet.signPsbt(psbtHex);
    // For compatible wallets, directly extract the transaction from the signed PSBT
    return Psbt.fromHex(signedHex).extractTransaction();
  };
};
