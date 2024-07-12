# Wallet Integration

The Bitcoin Wallet is an application that maintains the user's account and
connects to the Bitcoin network to identify important information about the
account, such as available funds, and to propagate transactions.

In this document,
we present the interface that the Babylon staking dApp expects from a Bitcoin
Wallet provider to fully integrate with it.
While we expect a wallet provider to implement all of the below methods,
there is the possibility that a provider might not have access to all the data
that the Babylon dApp requires. In the end of the document, we provide some
examples on how this limitation can be overcome through the utilisation of 3rd
party APIs.

Integration using this interface can happen in the following ways,
depending on the wallet provider:

- _Extension Wallets_ should work with the Babylon technical support team
  to create a class that wraps their internal wallet API into the expected
  Babylon interface and integrate it to the Babylon BTC Staking dApp.
  This way, when the user loads up the page in their browser,
  they will have the option to connect using the Extension Wallet.
- _Mobile Wallets_ can develop a class that wraps their internal Bitcoin APIs.
  Before the mobile in-app browser loads the Babylon staking dApp, an
  instance of this class should be injected under window.btcwallet.

## 1. Wallet Interface

Below is the wallet interface and useful types.
In the next section, we will provide examples of its utilisation.

```ts
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

  /**
   * Signs the given PSBT in hex format.
   * @param psbtHex - The hex string of the unsigned PSBT to sign.
   * @returns A promise that resolves to the hex string of the signed PSBT.
   */
  abstract signPsbt(psbtHex: string): Promise<string>;

  /**
   * Signs multiple PSBTs in hex format.
   * @param psbtsHexes - The hex strings of the unsigned PSBTs to sign.
   * @returns A promise that resolves to an array of hex strings, each representing a signed PSBT.
   */
  abstract signPsbts(psbtsHexes: string[]): Promise<string[]>;

  /**
   * Gets the network of the current account.
   * @returns A promise that resolves to the network of the current account.
   */
  abstract getNetwork(): Promise<Network>;

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
   * If the amount is provided, it will return UTXOs that cover the specified amount.
   * If the amount is not provided, it will return all available UTXOs for the address.
   *
   * @param address - The address to retrieve UTXOs for.
   * @param amount - Optional amount of funds required.
   * @returns A promise that resolves to an array of UTXOs.
   */
  abstract getUtxos(address: string, amount?: number): Promise<UTXO[]>;

  /**
   * Retrieves the tip height of the BTC chain.
   * @returns A promise that resolves to the block height.
   */
  abstract getBTCTipHeight(): Promise<number>;
}
```

## 2. Mobile Wallet Integration

A mobile wallet with an in-app browser option can be integrated into the dApp
by defining a class that implements the wallet interface and injecting an
instance of it under the `window.btcwallet` global object when the Babylon dApp
is loaded.

```ts
class MobileAppWallet extends WalletProvider {
    ...
    Interface Methods definitions
    ...
}
// Create an instance of the class
const wallet = new MobileAppWallet();

// Inject it under the `window.btcwallet` object before the Babylon dApp loads
window.btcwallet = wallet;
```

## 3. Example: OKX Wallet

As an example,
let's consider an object corresponding to the OKX wallet
that has been developed for integration into our dApp.
Notice that some of the methods required by the interface
are implemented using external calls to the mempool.space API as they are not
provided out of the box from the wallet exposed methods.

```ts
import { WalletProvider, Network, Fees, UTXO } from "../wallet_provider";
import {
  getAddressBalance,
  getTipHeight,
  getFundingUTXOs,
  getNetworkFees,
  pushTx,
} from "../../mempool_api";

type OKXWalletInfo = {
  publicKeyHex: string;
  address: string;
};

export class OKXWallet extends WalletProvider {
  private okxWalletInfo: OKXWalletInfo | undefined;

  constructor() {
    super();
  }

  connectWallet = async (): Promise<this> => {
    const okxwallet = window.okxwallet;
    try {
      await okxwallet.enable(); // Connect to OKX Wallet extension
    } catch (error) {
      if ((error as Error)?.message?.includes("rejected")) {
        throw new Error("Connection to OKX Wallet was rejected");
      } else {
        throw new Error((error as Error)?.message);
      }
    }
    let result = null;
    try {
      // this will not throw an error even if user has no BTC Signet enabled
      result = await okxwallet?.bitcoinSignet?.connect();
    } catch (error) {
      throw new Error("BTC Signet is not enabled in OKX Wallet");
    }

    const { address, compressedPublicKey } = result;

    if (compressedPublicKey && address) {
      this.okxWalletInfo = {
        publicKeyHex: compressedPublicKey,
        address,
      };
      return this;
    } else {
      throw new Error("Could not connect to OKX Wallet");
    }
  };

  getWalletProviderName = async (): Promise<string> => {
    return "OKX";
  };

  getAddress = async (): Promise<string> => {
    if (!this.okxWalletInfo) {
      throw new Error("OKX Wallet not connected");
    }
    return this.okxWalletInfo.address;
  };

  getPublicKeyHex = async (): Promise<string> => {
    if (!this.okxWalletInfo) {
      throw new Error("OKX Wallet not connected");
    }
    return this.okxWalletInfo.publicKeyHex;
  };

  signPsbt = async (psbtHex: string): Promise<string> => {
    if (!this.okxWalletInfo) {
      throw new Error("OKX Wallet not connected");
    }
    // sign the PSBT
    return (await this.signPsbts([psbtHex]))[0];
  };

  signPsbts = async (psbtsHexes: string[]): Promise<string[]> => {
    if (!this.okxWalletInfo) {
      throw new Error("OKX Wallet not connected");
    }
    // sign the PSBTs
    return await window?.okxwallet?.bitcoinSignet?.signPsbts(psbtsHexes);
  };

  signMessageBIP322 = async (message: string): Promise<string> => {
    if (!this.okxWalletInfo) {
      throw new Error("OKX Wallet not connected");
    }
    return await window?.okxwallet?.bitcoinSignet?.signMessage(
      message,
      "bip322-simple",
    );
  };

  getNetwork = async (): Promise<Network> => {
    return "testnet";
  };

  on = (eventName: string, callBack: () => void) => {
    if (!this.okxWalletInfo) {
      throw new Error("OKX Wallet not connected");
    }
    // subscribe to account change event
    if (eventName === "accountChanged") {
      return window.okxwallet.bitcoinSignet.on(eventName, callBack);
    }
  };

  // Mempool calls

  getBalance = async (): Promise<number> => {
    return await getAddressBalance(await this.getAddress());
  };

  getNetworkFees = async (): Promise<Fees> => {
    return await getNetworkFees();
  };

  pushTx = async (txHex: string): Promise<string> => {
    return await pushTx(txHex);
  };

  getUtxos = async (address: string, amount?: number): Promise<UTXO[]> => {
    // mempool call
    return await getFundingUTXOs(address, amount);
  };

  getBTCTipHeight = async (): Promise<number> => {
    return await getTipHeight();
  };
}
```

As a reference, we provide the mempool.space retrieval methods that we used below:

```ts
import { Fees, UTXO } from "./wallet/wallet_provider";

/*
    URL Construction methods
*/
// The base URL for the signet API
// Utilises an environment variable specifying the mempool API we intend to
// utilise
const mempoolAPI = `${getNetworkConfig().mempoolApiUrl}/api/`;

// URL for the address info endpoint
function addressInfoUrl(address: string): URL {
  return new URL(mempoolAPI + "address/" + address);
}

// URL for the transactions info endpoint
function txInfoUrl(txid: string): URL {
  return new URL(mempoolAPI + "tx/" + txid);
}

// URL for the push transaction endpoint
function pushTxUrl(): URL {
  return new URL(mempoolAPI + "tx");
}

// URL for retrieving information about an address' UTXOs
function utxosInfoUrl(address: string): URL {
  return new URL(mempoolAPI + "address/" + address + "/utxo");
}

// URL for retrieving information about the recommended network fees
function networkFeesUrl(): URL {
  return new URL(mempoolAPI + "v1/fees/recommended");
}

/**
 * Pushes a transaction to the Bitcoin network.
 * @param txHex - The hex string corresponding to the full transaction.
 * @returns A promise that resolves to the response message.
 */
export async function pushTx(txHex: string): Promise<string> {
  const response = await fetch(pushTxUrl(), {
    method: "POST",
    body: txHex,
  });
  if (!response.ok) {
    try {
      const mempoolError = await response.text();
      // Extract the error message from the response
      const message = mempoolError.split('"message":"')[1].split('"}')[0];
      if (mempoolError.includes("error") || mempoolError.includes("message")) {
        throw new Error(message);
      } else {
        throw new Error("Error broadcasting transaction. Please try again");
      }
    } catch (error: Error | any) {
      throw new Error(error?.message || error);
    }
  } else {
    return await response.text();
  }
}

/**
 * Returns the balance of an address.
 * @param address - The Bitcoin address in string format.
 * @returns A promise that resolves to the amount of satoshis that the address
 *          holds.
 */
export async function getAddressBalance(address: string): Promise<number> {
  const response = await fetch(addressInfoUrl(address));
  if (!response.ok) {
    const err = await response.text();
    throw new Error(err);
  } else {
    const addressInfo = await response.json();
    return (
      addressInfo.chain_stats.funded_txo_sum -
      addressInfo.chain_stats.spent_txo_sum
    );
  }
}

/**
 * Retrieve the recommended Bitcoin network fees.
 * @returns A promise that resolves into a `Fees` object.
 */
export async function getNetworkFees(): Promise<Fees> {
  const response = await fetch(networkFeesUrl());
  if (!response.ok) {
    const err = await response.text();
    throw new Error(err);
  } else {
    return await response.json();
  }
}

/**
 * Retrieve a set of UTXOs that are available to an address
 * and satisfy the `amount` requirement if provided. Otherwise, fetch all UTXOs.
 * The UTXOs are chosen based on descending amount order.
 * @param address - The Bitcoin address in string format.
 * @param amount - The amount we expect the resulting UTXOs to satisfy.
 * @returns A promise that resolves into a list of UTXOs.
 */
export async function getFundingUTXOs(
  address: string,
  amount?: number,
): Promise<UTXO[]> {
  // Get all UTXOs for the given address

  let utxos = null;
  try {
    const response = await fetch(utxosInfoUrl(address));
    utxos = await response.json();
  } catch (error: Error | any) {
    throw new Error(error?.message || error);
  }

  // Remove unconfirmed UTXOs as they are not yet available for spending
  // and sort them in descending order according to their value.
  // We want them in descending order, as we prefer to find the least number
  // of inputs that will satisfy the `amount` requirement,
  // as less inputs lead to a smaller transaction and therefore smaller fees.
  const confirmedUTXOs = utxos
    .filter((utxo: any) => utxo.status.confirmed)
    .sort((a: any, b: any) => b.value - a.value);

  // If amount is provided, reduce the list of UTXOs into a list that
  // contains just enough UTXOs to satisfy the `amount` requirement.
  let sliced = confirmedUTXOs;
  if (amount) {
    var sum = 0;
    for (var i = 0; i < confirmedUTXOs.length; ++i) {
      sum += confirmedUTXOs[i].value;
      if (sum > amount) {
        break;
      }
    }
    if (sum < amount) {
      return [];
    }
    sliced = confirmedUTXOs.slice(0, i + 1);
  }

  // Iterate through the final list of UTXOs to construct the result list.
  // The result contains some extra information,
  var result = [];
  for (var i = 0; i < sliced.length; ++i) {
    const response = await fetch(txInfoUrl(sliced[i].txid));
    const transactionInfo = await response.json();
    result.push({
      txid: sliced[i].txid,
      vout: sliced[i].vout,
      value: sliced[i].value,
      scriptPubKey: transactionInfo.vout[sliced[i].vout].scriptpubkey,
    });
  }
  return result;
}
```
