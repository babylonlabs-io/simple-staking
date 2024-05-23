import { getAddressBalance, getFundingUTXOs, getNetworkFees, getTipHeight, pushTx } from "@/utils/mempool_api";
import { Fees, Network, UTXO, WalletInfo, WalletProvider } from "../wallet_provider";

export const tomoProvider = "tomo_btc";

export class TomoWallet extends WalletProvider{
  private tomoWalletInfo: WalletInfo | undefined;

  constructor() {
    super();
  }

  connectWallet = async (): Promise<this> => {
    if (!window[tomoProvider]) {
      throw new Error("Tomo Wallet extension not found");
    }

    let addresses = null;
    let pubKey = null;
    try {
      // this will not throw an error even if user has no BTC Signet enabled
      addresses = await window[tomoProvider].connectWallet();
      pubKey = await window[tomoProvider].getPublicKey();
      if (!addresses || addresses.length === 0 || !pubKey) {
        throw new Error("BTC is not enabled in Tomo Wallet")
      }
    } catch (error) {
      throw new Error("BTC is not enabled in Tomo Wallet");
    }

    this.tomoWalletInfo = {
      publicKeyHex: pubKey,
      address: addresses[0]
    }
    return this
  };

  getWalletProviderName = async (): Promise<string> => {
    return "Tomo";
  };

  getAddress = async (): Promise<string> => {
    if (!this.tomoWalletInfo) {
      throw new Error("Tomo Wallet not connected");
    }
    return this.tomoWalletInfo.address;
  };

  getPublicKeyHex = async (): Promise<string> => {
    if (!this.tomoWalletInfo) {
      throw new Error("Tomo Wallet not connected");
    }
    return this.tomoWalletInfo?.publicKeyHex;
  };

  signPsbt = async (psbtHex: string): Promise<string> => {
    if (!this.tomoWalletInfo) {
      throw new Error("Tomo Wallet not connected");
    }
    // sign the PSBT
    return await window[tomoProvider].signPsbt(psbtHex);
  };

  signPsbts = async (psbtsHexes: string[]): Promise<string[]> => {
    if (!this.tomoWalletInfo) {
      throw new Error("Tomo Wallet not connected");
    }

    // sign the PSBTs
    return await window[tomoProvider]?.signPsbts(psbtsHexes);
  };

  signMessageBIP322 = async (message: string): Promise<string> => {
    if (!this.tomoWalletInfo) {
      throw new Error("Tomo Wallet not connected");
    }
    return await window[tomoProvider]?.signMessage(
      message,
      "bip322-simple",
    );
  };

  getNetwork = async (): Promise<Network> => {
    let network = await window[tomoProvider]?.getNetwork();
    if (network === 'mainnet') {
      throw new Error("On mainnet now, please switch to signet in wallet")
    }
    return network
  };

  on = (eventName: string, callBack: () => void) => {
    if (!this.tomoWalletInfo) {
      throw new Error("Tomo Wallet not connected");
    }
    // subscribe to account change event
    if (eventName === "accountChanged") {
      return window[tomoProvider].on(eventName, callBack);
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

  getUtxos = async (address: string, amount: number): Promise<UTXO[]> => {
    // mempool call
    return await getFundingUTXOs(address, amount);
  };

  getBTCTipHeight = async (): Promise<number> => {
    return await getTipHeight();
  };
}
