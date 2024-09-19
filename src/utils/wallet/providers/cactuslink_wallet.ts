import { getNetworkConfig } from "@/config/network.config";

import {
  getAddressBalance,
  getFundingUTXOs,
  getNetworkFees,
  getTipHeight,
  pushTx,
} from "../../mempool_api";
import {
  Fees,
  InscriptionIdentifier,
  Network,
  UTXO,
  WalletInfo,
  WalletProvider,
} from "../wallet_provider";

// Internal network names
const INTERNAL_NETWORK_NAMES = {
  [Network.MAINNET]: "livenet",
  [Network.TESTNET]: "testnet",
  [Network.SIGNET]: "signet",
};
export const cactusLinkProvider = "cactuslink";

export class CactusLinkWallet extends WalletProvider {
  private cactuslinkWalletInfo: WalletInfo | undefined;
  private bitcoinNetworkProvider: any;
  private networkEnv: Network | undefined;

  constructor() {
    super();

    // check whether there is an Cactus Link Wallet extension
    if (!window[cactusLinkProvider]) {
      throw new Error("Cactus Link Wallet extension not found");
    }

    this.networkEnv = getNetworkConfig().network;
    this.bitcoinNetworkProvider = window[cactusLinkProvider];
  }

  connectWallet = async (): Promise<any> => {
    const walletNetwork = await this.getNetwork();

    if (this.networkEnv !== walletNetwork) {
      throw new Error(
        `Wallet is not switched to Bitcoin ${this.networkEnv} network`,
      );
    }

    try {
      await this.bitcoinNetworkProvider.requestAccounts(); // Connect to Cactus Link Wallet extension
    } catch (error) {
      if ((error as Error)?.message?.includes("rejected")) {
        throw new Error("Connection to Cactus Link Wallet was rejected");
      } else {
        throw new Error((error as Error)?.message);
      }
    }

    const address = await this.getAddress();
    const publicKeyHex = await this.getPublicKeyHex();

    if (!address || !publicKeyHex) {
      throw new Error("Could not connect to Cactus Link Wallet");
    }

    this.cactuslinkWalletInfo = {
      publicKeyHex: publicKeyHex,
      address: address,
    };
    return this;
  };

  getWalletProviderName = async (): Promise<string> => {
    return "Cactus Link";
  };

  async getAddress(): Promise<string> {
    let accounts = (await this.bitcoinNetworkProvider.getAccounts()) || [];
    if (!accounts?.[0]) {
      throw new Error("Cactus Link Wallet not connected");
    }
    return accounts[0];
  }

  getPublicKeyHex = async (): Promise<string> => {
    let publicKey = await this.bitcoinNetworkProvider.getPublicKey();
    if (!publicKey) {
      throw new Error("Cactus Link Wallet not connected");
    }
    return publicKey;
  };

  signPsbt = async (psbtHex: string): Promise<string> => {
    if (!this.cactuslinkWalletInfo) {
      throw new Error("Cactus Link Wallet not connected");
    }
    return await this.bitcoinNetworkProvider.signPsbt(psbtHex, {
      autoFinalized: true,
    });
  };

  signPsbts = async (psbtsHexes: string[]): Promise<string[]> => {
    if (!this.cactuslinkWalletInfo) {
      throw new Error("Cactus Link Wallet not connected");
    }
    const options = psbtsHexes.map((_) => {
      return {
        autoFinalized: true,
      };
    });
    return await this.bitcoinNetworkProvider.signPsbts(psbtsHexes, options);
  };

  signMessageBIP322 = async (message: string): Promise<string> => {
    if (!this.cactuslinkWalletInfo) {
      throw new Error("Cactus Link Wallet not connected");
    }
    return await this.bitcoinNetworkProvider.signMessage(
      message,
      "bip322-simple",
    );
  };

  async getNetwork(): Promise<Network> {
    const internalNetwork = await this.bitcoinNetworkProvider.getNetwork();

    for (const [key, value] of Object.entries(INTERNAL_NETWORK_NAMES)) {
      if (value === internalNetwork) {
        return key as Network;
      }
    }

    throw new Error("Unsupported network");
  }

  on = (eventName: string, callBack: () => void) => {
    if (!this.cactuslinkWalletInfo) {
      throw new Error("Cactus Link Wallet not connected");
    }
    if (eventName === "accountChanged") {
      return this.bitcoinNetworkProvider.on("accountsChanged", callBack);
    }
    return this.bitcoinNetworkProvider.on(eventName, callBack);
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
    return await getFundingUTXOs(address, amount);
  };

  getBTCTipHeight = async (): Promise<number> => {
    return await getTipHeight();
  };

  getInscriptions(): Promise<InscriptionIdentifier[]> {
    throw new Error("Method not implemented.");
  }
}
