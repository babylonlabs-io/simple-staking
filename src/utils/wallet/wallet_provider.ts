export type Fees = {
  // fee for inclusion in the next block
  fastestFee: number;
  // fee for inclusion in a block in 30 mins
  halfHourFee: number;
  // fee for inclusion in a block in 1 hour
  hourFee: number;
  // economy fee: inclusion not guaranteed
  economyFee: number;
  // minimum fee: the minimum fee of the network
  minimumFee: number;
};

// UTXO is a structure defining attributes for a UTXO
export interface UTXO {
  // hash of transaction that holds the UTXO
  txid: string;
  // index of the output in the transaction
  vout: number;
  // amount of satoshis the UTXO holds
  value: number;
  // the script that the UTXO contains
  scriptPubKey: string;
}

// supported networks
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
   * @returns The name of the wallet provider.
   */
  abstract getWalletProviderName(): string;

  /**
   * Gets the address of the connected wallet.
   * @returns The address of the connected wallet.
   */
  abstract getAddress(): string;

  /**
   * Gets the public key of the connected wallet.
   * @returns The public key of the connected wallet.
   */
  abstract getPublicKeyHex(): string;

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
   * @returns The network of the current account.
   */
  abstract getNetwork(): Network;

  /**
   * Signs a message using BIP-322 simple.
   * @param message - The message to sign.
   * @returns A promise that resolves to the signed message.
   */
  abstract signMessageBIP322(message: string): Promise<string>;

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
  abstract getBalance(): Promise<number>;

  /**
   * Retrieves the network fees.
   * @returns A promise that resolves to the network fees.
   */
  abstract getNetworkFees(): Promise<Fees>;

  /**
   * Pushes a transaction to the network.
   * @param txHex - The hexadecimal representation of the transaction.
   * @returns A promise that resolves to a string representing the transaction ID.
   */
  abstract pushTx(txHex: string): Promise<string>;

  /**
   * Retrieves the unspent transaction outputs (UTXOs) for a given address and amount.
   * @param address - The address to retrieve UTXOs for.
   * @param amount - The amount of funds required.
   * @returns A promise that resolves to an array of UTXOs.
   */
  abstract getUtxos(address: string, amount: number): Promise<UTXO[]>;
}
