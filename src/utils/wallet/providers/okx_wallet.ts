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

// window object for OKX Wallet extension
export const okxProvider = "okxwallet";

export class OKXWallet extends WalletProvider {
  private okxWalletInfo: WalletInfo | undefined;
  private okxWallet: any;
  private bitcoinNetworkProvider: any;
  private networkEnv: Network | undefined;

  constructor() {
    super();

    // check whether there is an OKX Wallet extension
    if (!window[okxProvider]) {
      throw new Error("OKX Wallet extension not found");
    }

    this.okxWallet = window[okxProvider];
    this.networkEnv = getNetworkConfig().network;

    // OKX uses different providers for different networks
    switch (this.networkEnv) {
      case Network.MAINNET:
        this.bitcoinNetworkProvider = this.okxWallet.bitcoin;
        break;
      case Network.TESTNET:
        this.bitcoinNetworkProvider = this.okxWallet.bitcoinTestnet;
        break;
      case Network.SIGNET:
        this.bitcoinNetworkProvider = this.okxWallet.bitcoinSignet;
        break;
      default:
        throw new Error("Unsupported network");
    }
  }

  connectWallet = async (): Promise<this> => {
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
      // this will not throw an error even if user has no network enabled
      result = await this.bitcoinNetworkProvider.connect();
    } catch (error) {
      throw new Error(`BTC ${this.networkEnv} is not enabled in OKX Wallet`);
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
    // Use signPsbt since it shows the fees
    return await this.bitcoinNetworkProvider.signPsbt(
      psbtHex,
      // Required on 3.29.26 version
      {
        toSignInputs: [
          {
            index: 0,
            address: this.okxWalletInfo.address,
            disableTweakSigner: true,
          },
        ],
      },
    );
  };

  signPsbts = async (psbtsHexes: string[]): Promise<string[]> => {
    if (!this.okxWalletInfo) {
      throw new Error("OKX Wallet not connected");
    }
    // sign the PSBTs
    return await this.bitcoinNetworkProvider.signPsbts(psbtsHexes);
  };

  signMessageBIP322 = async (message: string): Promise<string> => {
    if (!this.okxWalletInfo) {
      throw new Error("OKX Wallet not connected");
    }
    return await this.bitcoinNetworkProvider.signMessage(
      message,
      "bip322-simple",
    );
  };

  getNetwork = async (): Promise<Network> => {
    // OKX does not provide a way to get the network for Signet and Testnet
    // So we pass the check on connection and return the environment network
    if (!this.networkEnv) {
      throw new Error("Network not set");
    }
    return this.networkEnv;
  };

  on = (eventName: string, callBack: () => void) => {
    if (!this.okxWalletInfo) {
      throw new Error("OKX Wallet not connected");
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

  // Inscriptions are only available on OKX Wallet BTC mainnet (i.e okxWallet.bitcoin)
  getInscriptions = async (): Promise<InscriptionIdentifier[]> => {
    if (!this.okxWalletInfo) {
      throw new Error("OKX Wallet not connected");
    }
    if (this.networkEnv !== Network.MAINNET) {
      throw new Error(
        "Inscriptions are only available on OKX Wallet BTC mainnet",
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
      throw new Error("Failed to get inscriptions from OKX Wallet");
    }

    return inscriptionIdentifiers;
  };
}
