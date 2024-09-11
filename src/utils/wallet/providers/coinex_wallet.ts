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

// window object for CoinEx Wallet extension
export const coinexWalletProvider = "coinexwallet";

// Internal network names
const INTERNAL_NETWORK_NAMES = {
  [Network.MAINNET]: "livenet",
  [Network.TESTNET]: "testnet",
  [Network.SIGNET]: "signet",
};

export class CoinExWallet extends WalletProvider {
  private bitcoinNetworkProvider: any;
  private networkEnv: Network | undefined;
  private coinexWalletInfo: WalletInfo | undefined;

  constructor() {
    super();

    // check whether there is an CoinEx Wallet extension
    if (!window[coinexWalletProvider]?.btcwallet) {
      throw new Error("CoinEx Wallet extension not found");
    }
    this.networkEnv = getNetworkConfig().network;

    this.bitcoinNetworkProvider = window[coinexWalletProvider].btcwallet;
  }

  connectWallet = async (): Promise<any> => {
    if (!this.networkEnv) {
      throw new Error("Network not found");
    }

    try {
      await this.bitcoinNetworkProvider.switchNetwork(
        INTERNAL_NETWORK_NAMES[this.networkEnv],
      );

      await this.bitcoinNetworkProvider.requestAccounts(); // Connect to CoinEx Wallet extension
    } catch (error) {
      if ((error as Error)?.message?.includes("rejected")) {
        throw new Error("Connection to CoinEx Wallet was rejected");
      } else {
        throw new Error((error as Error)?.message);
      }
    }

    const address = await this.bitcoinNetworkProvider.getAddress();
    const publicKeyHex = await this.bitcoinNetworkProvider.getPublicKeyHex();

    if (!address || !publicKeyHex) {
      throw new Error("Could not connect to CoinEx Wallet");
    }
    this.coinexWalletInfo = {
      publicKeyHex: publicKeyHex,
      address,
    };
    return this;
  };

  getWalletProviderName = async (): Promise<string> => {
    return "CoinEx Wallet";
  };

  getAddress = async (): Promise<string> => {
    if (!this.coinexWalletInfo) {
      throw new Error("CoinEx Wallet not connected");
    }
    return this.coinexWalletInfo.address;
  };

  getPublicKeyHex = async (): Promise<string> => {
    if (!this.coinexWalletInfo) {
      throw new Error("CoinEx Wallet not connected");
    }
    return this.coinexWalletInfo.publicKeyHex;
  };

  signPsbt = async (psbtHex: string): Promise<string> => {
    if (!this.coinexWalletInfo) {
      throw new Error("CoinEx Wallet not connected");
    }
    // sign the PSBT
    return await this.bitcoinNetworkProvider.signPsbt(psbtHex);
  };

  signPsbts = async (psbtsHexes: string[]): Promise<string[]> => {
    if (!this.coinexWalletInfo) {
      throw new Error("CoinEx Wallet not connected");
    }
    // sign the PSBTs
    return await this.bitcoinNetworkProvider.signPsbts(psbtsHexes);
  };

  signMessageBIP322 = async (message: string): Promise<string> => {
    if (!this.coinexWalletInfo) {
      throw new Error("CoinEx Wallet not connected");
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

  getUtxos = async (address: string, amount?: number): Promise<UTXO[]> => {
    return await getFundingUTXOs(address, amount);
  };

  getBTCTipHeight = async (): Promise<number> => {
    return await getTipHeight();
  };

  getInscriptions(): Promise<InscriptionIdentifier[]> {
    throw new Error("Method not implemented.");
  }
}
