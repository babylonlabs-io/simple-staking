import { network, validateAddress } from "@/config/network.config";
import {
  WalletProvider,
  Network,
  Fees,
  UTXO,
  WalletInfo,
} from "../wallet_provider";
import {
  getAddressBalance,
  getTipHeight,
  getFundingUTXOs,
  getNetworkFees,
  pushTx,
} from "../../mempool_api";

// window object for OKX Wallet extension
export const okxProvider = "okxwallet";

export class OKXWallet extends WalletProvider {
  private okxWalletInfo: WalletInfo | undefined;
  private okxWallet: any;
  private bitcoinNetwork: any;

  constructor() {
    super();

    // check whether there is an OKX Wallet extension
    if (!window[okxProvider]) {
      throw new Error("OKX Wallet extension not found");
    }

    this.okxWallet = window[okxProvider];
    this.bitcoinNetwork = this.okxWallet?.bitcoinSignet;
  }

  connectWallet = async (): Promise<this> => {
    const workingVersion = "2.83.26";

    const version = await window[okxProvider].getVersion();
    if (version < workingVersion) {
      throw new Error("Please update OKX Wallet to the latest version");
    }

    try {
      await this.okxWallet.enable(); // Connect to OKX Wallet extension
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
      result = await this.bitcoinNetwork.connect();
    } catch (error) {
      throw new Error("BTC Signet is not enabled in OKX Wallet");
    }

    const { address, compressedPublicKey } = result;

    validateAddress(network, address);

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
    return await this.bitcoinNetwork.signPsbts(psbtsHexes);
  };

  signMessageBIP322 = async (message: string): Promise<string> => {
    if (!this.okxWalletInfo) {
      throw new Error("OKX Wallet not connected");
    }
    return await this.bitcoinNetwork?.signMessage(message, "bip322-simple");
  };

  getNetwork = async (): Promise<Network> => {
    return Network.SIGNET;
  };

  on = (eventName: string, callBack: () => void) => {
    if (!this.okxWalletInfo) {
      throw new Error("OKX Wallet not connected");
    }
    // subscribe to account change event
    if (eventName === "accountChanged") {
      return this.okxWallet.on(eventName, callBack);
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
