import { getNetworkConfig } from "@/config/network.config";

import {
  getAddressBalance,
  getFundingUTXOs,
  getNetworkFees,
  pushTx,
} from "../../mempool_api";
import {
  BTCWalletProvider,
  Fees,
  InscriptionIdentifier,
  Network,
  UTXO,
  WalletInfo,
} from "../btc_wallet_provider";

export const oneKeyProvider = "$onekey";

// Internal network names
const INTERNAL_NETWORK_NAMES = {
  [Network.MAINNET]: "livenet",
  [Network.TESTNET]: "testnet",
  [Network.SIGNET]: "signet",
};

export class OneKeyWallet extends BTCWalletProvider {
  private oneKeyWalletInfo: WalletInfo | undefined;
  private oneKeyWallet: any;
  private bitcoinNetworkProvider: any;
  private networkEnv: Network | undefined;

  constructor() {
    super();

    // check whether there is an OneKey extension
    if (!window[oneKeyProvider]?.btcwallet) {
      throw new Error("OneKey Wallet extension not found");
    }

    this.oneKeyWallet = window[oneKeyProvider];

    // OneKey provider stays the same for all networks
    this.bitcoinNetworkProvider = this.oneKeyWallet.btcwallet;

    this.networkEnv = getNetworkConfig().network;
  }

  async connectWallet(): Promise<this> {
    const self = await this.bitcoinNetworkProvider.connectWallet();
    const walletNetwork = await this.getNetwork();

    if (this.networkEnv !== walletNetwork) {
      throw new Error(
        `Wallet is not switched to Bitcoin ${this.networkEnv} network`,
      );
    }

    // TODO `window.$onekey.btcwallet.switchNetwork` does not support "signet" network at the moment
    // Uncomment once it is supported
    // switch (this.networkEnv) {
    //   case Network.MAINNET:
    //     await this.bitcoinNetworkProvider.switchNetwork(
    //       INTERNAL_NETWORK_NAMES.mainnet,
    //     );
    //     break;
    //   case Network.TESTNET:
    //     await this.bitcoinNetworkProvider.switchNetwork(
    //       INTERNAL_NETWORK_NAMES.testnet,
    //     );
    //     break;
    //   case Network.SIGNET:
    //     await this.bitcoinNetworkProvider.switchNetwork(
    //       INTERNAL_NETWORK_NAMES.signet,
    //     );
    //     break;
    //   default:
    //     throw new Error("Unsupported network");
    // }
    const address = await this.bitcoinNetworkProvider.getAddress();
    const publicKeyHex = await this.bitcoinNetworkProvider.getPublicKeyHex();
    this.oneKeyWalletInfo = {
      address,
      publicKeyHex,
    };
    return self;
  }

  async getWalletProviderName(): Promise<string> {
    return this.bitcoinNetworkProvider.getWalletProviderName();
  }

  async getAddress(): Promise<string> {
    if (!this.oneKeyWalletInfo) {
      return this.bitcoinNetworkProvider.getAddress();
    }
    return this.oneKeyWalletInfo.address;
  }

  async getPublicKeyHex(): Promise<string> {
    if (!this.oneKeyWalletInfo) {
      return this.bitcoinNetworkProvider.getPublicKeyHex();
    }
    return this.oneKeyWalletInfo.publicKeyHex;
  }

  async signPsbt(psbtHex: string): Promise<string> {
    return this.bitcoinNetworkProvider.signPsbt(psbtHex);
  }

  async signPsbts(psbtsHexes: string[]): Promise<string[]> {
    return this.bitcoinNetworkProvider.signPsbts(psbtsHexes);
  }

  async getNetwork(): Promise<Network> {
    const internalNetwork = await this.bitcoinNetworkProvider.getNetwork();

    for (const [key, value] of Object.entries(INTERNAL_NETWORK_NAMES)) {
      if (value === "testnet") {
        return Network.SIGNET;
      }
      // TODO remove as soon as OneKey implements
      // in case of testnet return signet
      else if (value === internalNetwork) {
        return key as Network;
      }
    }

    throw new Error("Unsupported network");
  }

  async signMessageBIP322(message: string): Promise<string> {
    return this.bitcoinNetworkProvider.signMessageBIP322(message);
  }

  on(eventName: string, callBack: () => void): void {
    if (eventName === "accountChanged") {
      return this.bitcoinNetworkProvider.on("accountsChanged", callBack);
    }
    this.bitcoinNetworkProvider.on(eventName, callBack);
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
    return await pushTx(txHex);
  }

  async getUtxos(address: string, amount?: number): Promise<UTXO[]> {
    // mempool call
    return getFundingUTXOs(address, amount);
  }

  async getBTCTipHeight(): Promise<number> {
    return this.bitcoinNetworkProvider.getBTCTipHeight();
  }

  // Inscriptions are only available on oneKey Wallet BTC mainnet
  getInscriptions = async (): Promise<InscriptionIdentifier[]> => {
    if (this.networkEnv !== Network.MAINNET) {
      throw new Error("Inscriptions are only available on OneKey mainnet");
    }
    // max num of iterations to prevent infinite loop
    const MAX_ITERATIONS = 100;
    // Fetch inscriptions in batches of 100
    const limit = 100;
    const inscriptionIdentifiers: InscriptionIdentifier[] = [];
    let cursor = 0;
    let iterations = 0;
    try {
      while (iterations < MAX_ITERATIONS) {
        const { list } = await this.bitcoinNetworkProvider.getInscriptions(
          cursor,
          limit,
        );
        const identifiers = list.map((i: { output: string }) => {
          const [txid, vout] = i.output.split(":");
          return {
            txid,
            vout,
          };
        });
        inscriptionIdentifiers.push(...identifiers);
        if (list.length < limit) {
          break;
        }
        cursor += limit;
        iterations++;
        if (iterations >= MAX_ITERATIONS) {
          throw new Error(
            "Exceeded maximum iterations when fetching inscriptions",
          );
        }
      }
    } catch (error) {
      throw new Error("Failed to get inscriptions from OKX Wallet");
    }

    return inscriptionIdentifiers;
  };
}
