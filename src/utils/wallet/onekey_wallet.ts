import { Fees, Network, UTXO, WalletProvider } from "./wallet_provider";
import {
  getAddressBalance,
  getFundingUTXOs,
  getNetworkFees,
} from "../mempool_api";

export class OneKeyWallet extends WalletProvider {
  private provider = window.$onekey.btcwallet;

  async connectWallet(): Promise<this> {
    return this.provider.connectWallet();
  }

  async getWalletProviderName(): Promise<string> {
    return this.provider.getWalletProviderName();
  }

  async getAddress(): Promise<string> {
    return this.provider.getAddress();
  }

  async getPublicKeyHex(): Promise<string> {
    return this.provider.getPublicKeyHex();
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
