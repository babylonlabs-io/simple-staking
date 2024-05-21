import { Fees, Network, UTXO, WalletProvider } from "./wallet_provider";

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
    return this.provider.signPsbt(psbtHex);
  }

  async signPsbts(psbtsHexes: string[]): Promise<string[]> {
    return this.provider.signPsbts(psbtsHexes);
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
    return this.provider.getBalance();
  }

  async getNetworkFees(): Promise<Fees> {
    return this.provider.getNetworkFees();
  }

  async pushTx(txHex: string): Promise<string> {
    return this.provider.pushTx(txHex);
  }

  async getUtxos(address: string, amount: number): Promise<UTXO[]> {
    return this.provider.getUtxos(address, amount);
  }

  async getBTCTipHeight(): Promise<number> {
    return this.provider.getBTCTipHeight();
  }
}
