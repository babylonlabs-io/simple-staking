import { networks, Psbt, Transaction } from "bitcoinjs-lib";

import { getAddressBalance } from "./mempool_api";

export class OKXWalletInfo {
  publicKey: Buffer;
  address: string;
  network: networks.Network;
  isTaproot: boolean;

  constructor(publicKey: string, address: string, isTaproot: boolean) {
    this.publicKey = Buffer.from(publicKey, "hex");
    this.address = address;

    // we need to know if the address is taproot or not
    // to properly work with OKX Taproot implementation
    // in btcstaking.stakingTransaction
    this.isTaproot = isTaproot;

    this.network = networks.testnet;
  }

  async signTransaction(unsignedTx: Psbt): Promise<Transaction> {
    return (await this.signTransactions([unsignedTx]))[0];
  }

  async signTransactions(unsignedTxs: Psbt[]): Promise<Transaction[]> {
    // convert the PSBTs to hex strings
    const unsignedTxsHex = unsignedTxs.map((tx) => tx.toHex());

    // sign the PSBTs
    const response =
      await window?.okxwallet?.bitcoinSignet?.signPsbts(unsignedTxsHex);

    // convert the signed PSBTs to transactions
    return response.map((tx: any) => Psbt.fromHex(tx).extractTransaction());
  }

  btclibNetwork(): networks.Network {
    return this.network;
  }

  async getBalance(): Promise<number> {
    // mempool call
    return await getAddressBalance(this.address);
  }

  publicKeyNoCoord(): Buffer {
    return this.publicKey.subarray(1, 33);
  }
}

/**
 * Connects to the OKX Wallet extension and returns the wallet information.
 * @returns A promise that resolves to an instance of OKXWalletInfo.
 * @throws An error if the OKX wallet is not installed or if connection fails.
 */
export async function connectOKXWallet(): Promise<OKXWalletInfo> {
  const workingVersion = "2.83.26";
  // check whether there is an OKX Wallet extension
  if (!window.okxwallet) {
    throw new Error("OKX Wallet extension not found");
  }

  const version = await window.okxwallet.getVersion();
  if (version < workingVersion) {
    throw new Error("Please update OKX Wallet to the latest version");
  }

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

  const nativeSegwitAddressLength = 42;
  const taprootAddressLength = 62;

  if (
    address.length !== nativeSegwitAddressLength &&
    address.length !== taprootAddressLength
  ) {
    throw new Error(
      "Invalid address type. Please use a Native SegWit or Taptoor",
    );
  }

  if (compressedPublicKey && address) {
    return new OKXWalletInfo(
      compressedPublicKey,
      address,
      address.length === taprootAddressLength,
    );
  } else {
    throw new Error("Could not connect to OKX Wallet");
  }
}
