import { network, validateAddress } from "@/config/network.config";

import { getNetworkFees, getTipHeight, pushTx } from "../../mempool_api";
import {
  Fees,
  Network,
  UTXO,
  WalletInfo,
  WalletProvider,
} from "../wallet_provider";

// window object for imToken Wallet extension
export const imTokenProvider = "bitcoin";

export class ImTokenWallet extends WalletProvider {
  private imTokenAccount: WalletInfo | undefined;
  private imTokenProvider: any;

  constructor() {
    super();

    // check whether there is an imToken Wallet extension
    if (!window[imTokenProvider]) {
      throw new Error("imToken Wallet extension not found");
    }

    this.imTokenProvider = window[imTokenProvider];
  }

  connectWallet = async (): Promise<this> => {
    if (!this.imTokenProvider) {
      throw new Error("imToken Wallet extension not found");
    }

    const workingVersion = "0.0.1";
    const version = await this.imTokenProvider.getVersion();
    if (version < workingVersion) {
      throw new Error("Please update imToken Wallet to the latest version");
    }

    const accounts = await this.imTokenProvider.request("btc_requestAccounts");
    const [address] = accounts;
    validateAddress(network, address);

    const publicKey = await this.imTokenProvider.request("btc_getPublicKey");

    if (address && publicKey) {
      this.imTokenAccount = {
        address,
        publicKeyHex: publicKey,
      };
      return this;
    } else {
      throw new Error("Could not connect to imToken Wallet");
    }
  };

  getWalletProviderName = async (): Promise<string> => {
    if (!this.imTokenProvider) {
      throw new Error("imToken Wallet not connected");
    }
    return await this.imTokenProvider.getName();
  };

  getAccount = async (): Promise<WalletInfo> => {
    if (!this.imTokenProvider || !this.imTokenAccount) {
      throw new Error("imToken Wallet not connected");
    }
    return this.imTokenAccount;
  };

  getAddress = async (): Promise<string> => {
    const account = await this.getAccount();
    return account.address;
  };

  getPublicKeyHex = async (): Promise<string> => {
    const account = await this.getAccount();
    return account.publicKeyHex;
  };

  signPsbt = async (psbtHex: string): Promise<string> => {
    if (!this.imTokenProvider) {
      throw new Error("imToken Wallet not connected");
    }
    return await this.imTokenProvider.request("btc_signPsbt", [psbtHex]);
  };

  signPsbts = async (psbtsHexes: string[]): Promise<string[]> => {
    if (!this.imTokenProvider) {
      throw new Error("imToken Wallet not connected");
    }
    return await this.imTokenProvider.request("btc_signPsbts", [psbtsHexes]);
  };

  signMessageBIP322 = async (message: string): Promise<string> => {
    if (!this.imTokenProvider) {
      throw new Error("imToken Wallet not connected");
    }
    return await this.imTokenProvider.request("btc_signMessage", [
      message,
      "bip322-simple",
    ]);
  };

  getNetwork = async (): Promise<Network> => {
    if (!this.imTokenProvider) {
      throw new Error("imToken Wallet not connected");
    }
    return await this.imTokenProvider.request("btc_getNetwork");
  };

  on = (eventName: string, callBack: () => void) => {
    if (!this.imTokenProvider) {
      throw new Error("imToken Wallet not connected");
    }
    if (eventName === "accountChanged") {
      return this.imTokenProvider.on(eventName, callBack);
    }
  };

  getBalance = async (): Promise<number> => {
    if (!this.imTokenProvider) {
      throw new Error("imToken Wallet not connected");
    }
    const address = await this.getAddress();
    return await this.imTokenProvider.request("btc_getBalance", [address]);
  };

  getNetworkFees = async (): Promise<Fees> => {
    return await getNetworkFees();
  };

  pushTx = async (txHex: string): Promise<string> => {
    return await pushTx(txHex);
  };

  getUtxos = async (address: string, amount: number): Promise<UTXO[]> => {
    if (!this.imTokenProvider) {
      throw new Error("imToken Wallet not connected");
    }
    const balance = await this.getBalance();
    return await this.imTokenProvider.request("btc_getUnspent", [
      address,
      amount || balance,
    ]);
  };

  getBTCTipHeight = async (): Promise<number> => {
    return await getTipHeight();
  };
}
