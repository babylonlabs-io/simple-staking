import { Fees } from "@/types/Fees";
import { UTXO } from "../btcstaking";
import {
  getAddressBalance,
  getFundingUTXOs,
  getNetworkFees,
  pushTx,
} from "../mempool_api";

export type Network = "mainnet" | "testnet" | "regtest" | "signet";

/**
 * Abstract class representing a wallet provider.
 * Provides methods for connecting to a wallet, retrieving wallet information, signing transactions, and more.
 */

export abstract class WalletProvider {
  /**
   * Connects to the wallet and returns the instance of the wallet provider.
   * Currently only supports "native segwit" and "taproot" address types.
   * @returns A promise that resolves to an instance of the wrapper wallet provider in babylon friendly format.
   * @throws An error if the wallet is not installed or if connection fails.
   */
  abstract connectWallet(): Promise<this>;

  /**
   * Gets the name of the wallet provider.
   * @returns A promise that resolves to the name of the wallet provider.
   */
  abstract getWalletProviderName(): Promise<string>;

  /**
   * Gets the address of the connected wallet.
   * @returns A promise that resolves to the address of the connected wallet.
   */
  abstract getAddress(): Promise<string>;

  /**
   * Gets the public key of the connected wallet.
   * @returns A promise that resolves to the public key of the connected wallet.
   */
  abstract getPublicKeyHex(): Promise<string>;

  // TODO move mempool actual implementation and calls inside okx_wallet using functions

  /**
   * Signs a transaction. Should finalize after signing.
   * @param psbtHex - The hex string of the unsigned PSBT to sign.
   * @returns A promise that resolves to the signed transaction.
   */
  abstract signPsbt(psbtHex: string): Promise<string>;

  /**
   * Signs multiple transactions. Should finalize after signing.
   * @param psbtsHexes - The hex strings of the unsigned PSBTs to sign.
   * @returns A promise that resolves to an array of signed transactions.
   */
  abstract signPsbts(psbtsHexes: string[]): Promise<string[]>;

  /**
   * Gets the network of the current account.
   * @returns A promise that resolves to the network of the current account.
   */
  abstract getNetwork(): Promise<Network>;

  /**
   * Signs a message.
   * @param message - The message to sign.
   * @param method - The signing method to use (optional).
   * @returns A promise that resolves to the signed message.
   */
  abstract signMessage(message: string, method?: string): Promise<string>;

  /**
   * Registers an event listener for the specified event.
   * At the moment, only the "accountChanged" event is supported.
   * @param eventName - The name of the event to listen for.
   * @param callBack - The callback function to be executed when the event occurs.
   */
  abstract on(eventName: string, callBack: () => void): void;

  /**
   * Gets the balance for the connected wallet address.
   * By default, this method will return the mempool balance if not implemented by the child class.
   * @returns A promise that resolves to the balance of the wallet.
   */
  async getBalance(): Promise<number> {
    // mempool call
    return await getAddressBalance(await this.getAddress());
  }

  /**
   * Retrieves the network fees.
   * @returns A promise that resolves to the network fees.
   */
  async getNetworkFees(): Promise<Fees> {
    // mempool call
    return await getNetworkFees();
  }

  /**
   * Pushes a transaction to the network.
   * @param txHex - The hexadecimal representation of the transaction.
   * @returns A promise that resolves to a string representing the transaction ID.
   */
  async pushTx(txHex: string): Promise<string> {
    // mempool call
    return await pushTx(txHex);
  }

  /**
   * Retrieves the unspent transaction outputs (UTXOs) for a given address and amount.
   * @param address - The address to retrieve UTXOs for.
   * @param amount - The amount of funds required.
   * @returns A promise that resolves to an array of UTXOs.
   */
  async getUtxos(address: string, amount: number): Promise<UTXO[]> {
    // mempool call
    return await getFundingUTXOs(address, amount);
  }
}
