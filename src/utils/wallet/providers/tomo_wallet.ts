import { getNetworkConfig } from "@/config/network.config";
import {
  getAddressBalance,
  getFundingUTXOs,
  getNetworkFees,
  getTipHeight,
  pushTx,
} from "@/utils/mempool_api";

import {
  Fees,
  Network,
  UTXO,
  WalletInfo,
  WalletProvider,
} from "../wallet_provider";

export const tomoProvider = "tomo_btc";

// Internal network names
const INTERNAL_NETWORK_NAMES = {
  [Network.MAINNET]: "mainnet",
  [Network.TESTNET]: "testnet",
  [Network.SIGNET]: "signet",
};

export class TomoWallet extends WalletProvider {
  private tomoWalletInfo: WalletInfo | undefined;
  private bitcoinNetworkProvider: any;
  private networkEnv: Network | undefined;

  constructor() {
    super();

    // check whether there is Tomo extension
    if (!window[tomoProvider]) {
      throw new Error("Tomo Wallet extension not found");
    }
    this.networkEnv = getNetworkConfig().network;

    this.bitcoinNetworkProvider = window[tomoProvider];
  }

  connectWallet = async (): Promise<this> => {
    const workingVersion = "1.2.0";
    if (!this.bitcoinNetworkProvider) {
      throw new Error("Tomo Wallet extension not found");
    }
    if (!this.networkEnv) {
      throw new Error("Network not found");
    }
    if (this.bitcoinNetworkProvider.getVersion) {
      const version = await this.bitcoinNetworkProvider.getVersion();
      if (version < workingVersion) {
        throw new Error("Please update Tomo Wallet to the latest version");
      }
    }

    await this.bitcoinNetworkProvider.switchNetwork(
      INTERNAL_NETWORK_NAMES[this.networkEnv],
    );

    let addresses = null;
    let pubKey = null;
    try {
      // this will not throw an error even if user has no BTC Signet enabled
      addresses = await this.bitcoinNetworkProvider.connectWallet();
      pubKey = await this.bitcoinNetworkProvider.getPublicKey();
      if (!addresses || addresses.length === 0 || !pubKey) {
        throw new Error("BTC is not enabled in Tomo Wallet");
      }
    } catch (error) {
      throw new Error("BTC is not enabled in Tomo Wallet");
    }

    this.tomoWalletInfo = {
      publicKeyHex: pubKey,
      address: addresses[0],
    };
    return this;
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
    return this.tomoWalletInfo.publicKeyHex;
  };

  signPsbt = async (psbtHex: string): Promise<string> => {
    if (!this.tomoWalletInfo) {
      throw new Error("Tomo Wallet not connected");
    }
    // sign the PSBT
    return await this.bitcoinNetworkProvider.signPsbt(psbtHex);
  };

  signPsbts = async (psbtsHexes: string[]): Promise<string[]> => {
    if (!this.tomoWalletInfo) {
      throw new Error("Tomo Wallet not connected");
    }

    // sign the PSBTs
    return await this.bitcoinNetworkProvider.signPsbts(psbtsHexes);
  };

  signMessageBIP322 = async (message: string): Promise<string> => {
    if (!this.tomoWalletInfo) {
      throw new Error("Tomo Wallet not connected");
    }
    return await this.bitcoinNetworkProvider.signMessage(
      message,
      "bip322-simple",
    );
  };

  getNetwork = async (): Promise<Network> => {
    const internalNetwork = await this.bitcoinNetworkProvider.getNetwork();

    for (const [key, value] of Object.entries(INTERNAL_NETWORK_NAMES)) {
      if (value === internalNetwork) {
        return key as Network;
      }
    }

    throw new Error("Unsupported network");
  };

  on = (eventName: string, callBack: () => void) => {
    if (!this.tomoWalletInfo) {
      throw new Error("Tomo Wallet not connected");
    }
    // subscribe to account change event
    if (eventName === "accountChanged") {
      return this.bitcoinNetworkProvider.on(eventName, callBack);
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
