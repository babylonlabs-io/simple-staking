import { getAddressBalance } from "../mempool_api";




export type Network = "mainnet" | "testnet" | "regtest" | "signet";

export abstract class WalletProvider {
    /**
     * Connects to the wallet and returns the instance of the wallet provider.
     * Currently only support "native segwit" and "taproot" address types.
     * @returns A promise that resolves to an instance of the wrapper wallet provider in babylon friendly format.
     * @throws An error if the wallet is not installed or if connection fails.
     */
    abstract connectWallet(): Promise<this>;

    abstract getWalletProviderName(): Promise<string>;

    // Get the address of the connected wallet.
    abstract getAddress(): Promise<string>;

    // Get the public key of the connected wallet.
    abstract getPublicKeyHex(): Promise<string>;

    /**
     * Sign a transaction.
     * @param psbtHex the hex string of psbt to sign
     */
    abstract signPsbt(unsignedTx: string): Promise<string>;

    // Get network of current account
    abstract getNetwork(): Promise<Network>;

    /**
     * Get the balance for the connectted wallet address.
     * By default this method will return the mempool balance if not being implemented by the child class.
     * @returns A promise that resolves to the balance of the wallet.
     */
    async getBalance(): Promise<number> {
        // mempool call
        return await getAddressBalance(await this.getAddress());
    }
}