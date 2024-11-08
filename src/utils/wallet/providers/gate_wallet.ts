import {
  getNetworkConfig,
  network,
  validateAddress,
} from "@/config/network.config";

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

// window object for gate Wallet extension
export const gateProvider = "gatewallet";

export class GateWallet extends WalletProvider {
  private gateWalletInfo: WalletInfo | undefined;
  private gateWallet: any;
  private bitcoinNetworkProvider: any;
  private networkEnv: Network | undefined;

  constructor() {
    super();

    // check whether there is an gate Wallet extension
    if (!window[gateProvider]) {
      throw new Error("gate Wallet extension not found");
    }

    this.gateWallet = window[gateProvider];
    this.networkEnv = getNetworkConfig().network;

    // gate uses different providers for different networks
    switch (this.networkEnv) {
      case Network.MAINNET:
        this.bitcoinNetworkProvider = this.gateWallet.bitcoin;
        break;
      case Network.TESTNET:
        this.bitcoinNetworkProvider = this.gateWallet.bitcoinTestnet;
        break;
      case Network.SIGNET:
        this.bitcoinNetworkProvider = this.gateWallet.bitcoinSignet;
        break;
      default:
        throw new Error("Unsupported network");
    }
  }

  connectWallet = async (): Promise<this> => {
    try {
      // this will not throw an error even if user has no network enabled
      await this.bitcoinNetworkProvider.requestAccounts();
    } catch (error) {
      throw new Error(`BTC ${this.networkEnv} is not enabled in gate Wallet`);
    }
    const address = await this.getAddress();
    const publicKeyHex = await this.getPublicKeyHex();
    validateAddress(network, address);
    if (!address || !publicKeyHex) {
      throw new Error("Could not connect to Bitget Wallet");
    }
    this.gateWalletInfo = {
      address,
      publicKeyHex,
    };
    return this;
  };

  getWalletProviderName = async (): Promise<string> => {
    return "GateWallet";
  };

  getAddress = async (): Promise<string> => {
    let accounts = (await this.bitcoinNetworkProvider.getAccounts()) || [];
    if (!accounts?.[0]) {
      throw new Error("gate Wallet not connected");
    }
    return accounts[0];
  };

  getPublicKeyHex = async (): Promise<string> => {
    let publicKey = await this.bitcoinNetworkProvider.getPublicKey();
    if (!publicKey) {
      throw new Error("gate Wallet not connected");
    }
    return publicKey;
  };

  signPsbt = async (psbtHex: string): Promise<string> => {
    if (!this.gateWalletInfo) {
      throw new Error("gate Wallet not connected");
    }
    // Use signPsbt since it shows the fees
    return await this.bitcoinNetworkProvider.signPsbt(psbtHex);
  };

  signPsbts = async (psbtsHexes: string[]): Promise<string[]> => {
    if (!this.gateWalletInfo) {
      throw new Error("gate Wallet not connected");
    }
    // sign the PSBTs
    return await this.bitcoinNetworkProvider.signPsbts(psbtsHexes);
  };

  signMessageBIP322 = async (message: string): Promise<string> => {
    if (!this.gateWalletInfo) {
      throw new Error("gate Wallet not connected");
    }
    return await this.bitcoinNetworkProvider.signMessage(
      message,
      "bip322-simple",
    );
  };

  getNetwork = async (): Promise<Network> => {
    // gate does not provide a way to get the network for Signet and Testnet
    // So we pass the check on connection and return the environment network
    if (!this.networkEnv) {
      throw new Error("Network not set");
    }
    return this.networkEnv;
  };

  on = (eventName: string, callBack: () => void) => {
    if (!this.gateWalletInfo) {
      throw new Error("gate Wallet not connected");
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

  getUtxos = async (address: string, amount: number): Promise<UTXO[]> => {
    // mempool call
    return await getFundingUTXOs(address, amount);
  };

  getBTCTipHeight = async (): Promise<number> => {
    return await getTipHeight();
  };

  // Inscriptions are only available on gate Wallet BTC mainnet (i.e gateWallet.bitcoin)
  getInscriptions = async (): Promise<InscriptionIdentifier[]> => {
    if (!this.gateWalletInfo) {
      throw new Error("gate Wallet not connected");
    }
    if (this.networkEnv !== Network.MAINNET) {
      throw new Error(
        "Inscriptions are only available on gate Wallet BTC mainnet",
      );
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
      throw new Error("Failed to get inscriptions from gate Wallet");
    }

    return inscriptionIdentifiers;
  };
}
