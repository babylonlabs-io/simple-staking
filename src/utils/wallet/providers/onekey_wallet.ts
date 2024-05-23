import { Fees, Network, UTXO, WalletInfo, WalletProvider } from "../wallet_provider";
import {
  getAddressBalance,
  getFundingUTXOs,
  getNetworkFees,
} from "../../mempool_api";
import { Transaction } from "bitcoinjs-lib";

export const oneKeyProvider = '$onekey'

export class OneKeyWallet extends WalletProvider {
  private oneKeyWalletInfo: WalletInfo | undefined;

  async connectWallet(): Promise<this> {
    const self = await window[oneKeyProvider].btcwallet.connectWallet();
    const address = await this.getAddress()
    const publicKeyHex = await this.getPublicKeyHex()
    this.oneKeyWalletInfo = {
      address,
      publicKeyHex
    }
    return self
  }

  async getWalletProviderName(): Promise<string> {
    return window[oneKeyProvider].btcwallet.getWalletProviderName();
  }

  async getAddress(): Promise<string> {
    if (!this.oneKeyWalletInfo) {
      return window[oneKeyProvider].btcwallet.getAddress();
    }
    return this.oneKeyWalletInfo.address;
  }

  async getPublicKeyHex(): Promise<string> {
    if (!this.oneKeyWalletInfo) {
      return window[oneKeyProvider].btcwallet.getPublicKeyHex();
    }
    return this.oneKeyWalletInfo.publicKeyHex;
  }

  async signPsbt(psbtHex: string): Promise<string> {
    return window[oneKeyProvider].btcwallet.signPsbt(psbtHex);
  }

  async signPsbts(psbtsHexes: string[]): Promise<string[]> {
    return window[oneKeyProvider].btcwallet.signPsbts(psbtsHexes);
  }

  async getNetwork(): Promise<Network> {
    return window[oneKeyProvider].btcwallet.getNetwork();
  }

  async signMessageBIP322(message: string): Promise<string> {
    return window[oneKeyProvider].btcwallet.signMessageBIP322(message);
  }

  on(eventName: string, callBack: () => void): void {
    window[oneKeyProvider].btcwallet.on(eventName, callBack);
  }

  async getBalance(): Promise<number> {
    // mempool call
    return getAddressBalance(await this.getAddress());
  }

  async getNetworkFees(): Promise<Fees> {
    // mempool call
    return getNetworkFees();
  }

  async pushTx(txHex: string): Promise<string> {
    return window[oneKeyProvider].btcwallet.pushTx(txHex);
  }

  async getUtxos (address: string, amount: number): Promise<UTXO[]>  {
    // mempool call
    return getFundingUTXOs(address, amount);
  };

  async getBTCTipHeight(): Promise<number> {
    return window[oneKeyProvider].btcwallet.getBTCTipHeight();
  }

  convertSignedPsbtToTransaction(signedPsbtHex: string): Promise<Transaction> {
    return Promise.resolve(Transaction.fromHex(signedPsbtHex));
  }
}
