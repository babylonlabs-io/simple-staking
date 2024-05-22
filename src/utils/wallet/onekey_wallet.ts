import { Fees, Network, UTXO, WalletInfo, WalletProvider } from "./wallet_provider";
import {
  getAddressBalance,
  getFundingUTXOs,
  getNetworkFees,
} from "../mempool_api";

export class OneKeyWallet extends WalletProvider {
  private provider = window.$onekey.btcwallet;
  private onekeyWalletInfo: WalletInfo | undefined;

  async connectWallet(): Promise<this> {
    const self = await this.provider.connectWallet();
    const address = await this.getAddress()
    const publicKeyHex = await this.getPublicKeyHex()
    this.onekeyWalletInfo = {
      address,
      publicKeyHex
    }
    return self
  }

  async getWalletProviderName(): Promise<string> {
    return this.provider.getWalletProviderName();
  }

  async getAddress(): Promise<string> {
    if (!this.onekeyWalletInfo) {
      return this.provider.getAddress();
    }
    return this.onekeyWalletInfo.address;
  }

  async getPublicKeyHex(): Promise<string> {
    if (!this.onekeyWalletInfo) {
      return this.provider.getPublicKeyHex();
    }
    return this.onekeyWalletInfo.publicKeyHex;
  }

  async signPsbt(psbtHex: string): Promise<string> {
    return window.$onekey.btc.signPsbt(psbtHex);
  }

  async signPsbts(psbtsHexes: string[]): Promise<string[]> {
    return window.$onekey.btc.signPsbts(psbtsHexes);
  }

  async getNetwork(): Promise<Network> {
    return this.provider.getNetwork();
  }

  async signMessageBIP322(message: string): Promise<string> {
    return this.provider.signMessageBIP322(message);
  }

  on(eventName: string, callBack: () => void): void {
    this.provider.on(eventName, callBack);
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
    return this.provider.pushTx(txHex);
  }

  async getUtxos (address: string, amount: number): Promise<UTXO[]>  {
    // mempool call
    return getFundingUTXOs(address, amount);
  };

  async getBTCTipHeight(): Promise<number> {
    return this.provider.getBTCTipHeight();
  }
}
