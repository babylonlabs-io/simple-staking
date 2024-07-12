import { network, validateAddress } from "@/config/network.config";

import {
  getAddressBalance,
  getFundingUTXOs,
  getNetworkFees,
  getTipHeight,
  pushTx,
} from "../../mempool_api";
import {
  Fees,
  Network,
  UTXO,
  WalletInfo,
  WalletProvider,
} from "../wallet_provider";

// window object for Gate Wallet extension
export const gateProvider: any = "gatewallet";

export class GateWallet extends WalletProvider {
  private gateWalletInfo: WalletInfo | undefined;
  private gateWallet: any;
  private bitcoinNetwork: any;

  constructor() {
    super();

    // check whether there is an Gate Wallet extension
    if (!window[gateProvider]) {
      throw new Error("Gate Wallet extension not found");
    }

    this.gateWallet = window[gateProvider];
    this.bitcoinNetwork = this.gateWallet?.bitcoin;
  }

  connectWallet = async (): Promise<this> => {
    let result;
    try {
      result = await this.bitcoinNetwork.requestAccounts("SIGNET_TEST"); // Connect to Gate Wallet extension
    } catch (error) {
      if ((error as Error)?.message?.includes("rejected")) {
        throw new Error("Connection to Gate Wallet was rejected");
      } else {
        throw new Error((error as Error)?.message);
      }
    }

    const [address] = result;

    validateAddress(network, address);

    const publicKeyHex = await this.bitcoinNetwork.getPublicKey("SIGNET_TEST");

    if (publicKeyHex && address) {
      this.gateWalletInfo = {
        publicKeyHex,
        address,
      };
      return this;
    } else {
      throw new Error("Could not connect to Gate Wallet");
    }
  };

  getWalletProviderName = async (): Promise<string> => {
    return "gatewallet";
  };

  getAddress = async (): Promise<string> => {
    if (!this.gateWalletInfo) {
      throw new Error("Gate Wallet not connected");
    }
    return this.gateWalletInfo.address;
  };

  getPublicKeyHex = async (): Promise<string> => {
    if (!this.gateWalletInfo) {
      throw new Error("Gate Wallet not connected");
    }
    return this.gateWalletInfo.publicKeyHex;
  };

  signPsbt = async (psbtHex: string): Promise<string> => {
    if (!this.gateWalletInfo) {
      throw new Error("Gate Wallet not connected");
    }
    // sign the PSBT
    return await this.bitcoinNetwork.signPsbt({
      fromAddress: this.gateWalletInfo.address,
      psbtHex,
      network: "SIGNET_TEST",
    });
  };

  signPsbts = async (psbtsHexes: string[]): Promise<string[]> => {
    if (!this.gateWalletInfo) {
      throw new Error("Gate Wallet not connected");
    }
    // sign the PSBTs
    return await this.bitcoinNetwork.signPsbts({
      fromAddress: this.gateWalletInfo.address,
      psbtHexs: psbtsHexes,
      network: "SIGNET_TEST",
    });
  };

  signMessageBIP322 = async (message: string): Promise<string> => {
    if (!this.gateWalletInfo) {
      throw new Error("Gate Wallet not connected");
    }
    return await this.bitcoinNetwork?.signMessage({
      text: message,
      type: "bip322-simple",
      fromAddress: this.gateWalletInfo.address,
      network: "SIGNET_TEST",
    });
  };

  getNetwork = async (): Promise<Network> => {
    return Network.SIGNET;
  };

  on = (eventName: string, callBack: () => void) => {
    if (!this.gateWalletInfo) {
      throw new Error("Gate Wallet not connected");
    }
    // subscribe to account change event
    if (eventName === "accountChanged") {
      return this.gateWallet.on(eventName, callBack);
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