import { Psbt } from "bitcoinjs-lib";

import { getNetworkConfig } from "@/config/network.config";

import {
  getAddressBalance,
  getFundingUTXOs,
  getNetworkFees,
  getTipHeight,
  pushTx,
} from "../../mempool_api";
import { Fees, Network, UTXO, WalletProvider } from "../wallet_provider";

// window object for Bitget Wallet extension
export const bitgetWalletProvider = "bitkeep";

// Internal network names
const INTERNAL_NETWORK_NAMES = {
  [Network.MAINNET]: "livenet",
  [Network.TESTNET]: "testnet",
  [Network.SIGNET]: "signet",
};

export class BitgetWallet extends WalletProvider {
  private bitcoinNetworkProvider: any;
  private networkEnv: Network | undefined;

  constructor() {
    super();

    // check whether there is an Bitget Wallet extension
    if (!window[bitgetWalletProvider]?.unisat) {
      throw new Error("Bitget Wallet extension not found");
    }
    this.networkEnv = getNetworkConfig().network;

    this.bitcoinNetworkProvider = window[bitgetWalletProvider].unisat;
  }

  connectWallet = async (): Promise<any> => {
    if (!this.networkEnv) {
      throw new Error("Network not found");
    }

    try {
      await this.bitcoinNetworkProvider.switchNetwork(
        INTERNAL_NETWORK_NAMES[this.networkEnv],
      );

      await this.bitcoinNetworkProvider.requestAccounts(); // Connect to Bitget Wallet extension
    } catch (error) {
      if ((error as Error)?.message?.includes("rejected")) {
        throw new Error("Connection to Bitget Wallet was rejected");
      } else {
        throw new Error((error as Error)?.message);
      }
    }

    const address = await this.getAddress();
    const publicKeyHex = await this.getPublicKeyHex();

    if (!address || !publicKeyHex) {
      throw new Error("Could not connect to Bitget Wallet");
    }
    return this;
  };

  getWalletProviderName = async (): Promise<string> => {
    return "Bitget Wallet";
  };

  getAddress = async (): Promise<string> => {
    let accounts = (await this.bitcoinNetworkProvider.getAccounts()) || [];
    if (!accounts?.[0]) {
      throw new Error("Bitget Wallet not connected");
    }
    return accounts[0];
  };

  getPublicKeyHex = async (): Promise<string> => {
    let publicKey = await this.bitcoinNetworkProvider.getPublicKey();
    if (!publicKey) {
      throw new Error("Bitget Wallet not connected");
    }
    return publicKey;
  };

  signPsbt = async (psbtHex: string): Promise<string> => {
    const data = {
      method: "signPsbt",
      params: {
        from: this.bitcoinNetworkProvider.selectedAddress,
        __internalFunc: "__signPsbt_babylon",
        psbtHex,
        options: {
          autoFinalized: true,
        },
      },
    };

    let signedPsbt = await this.bitcoinNetworkProvider.request(
      "dappsSign",
      data,
    );
    let psbt = Psbt.fromHex(signedPsbt);

    const allFinalized = psbt.data.inputs.every(
      (input) => input.finalScriptWitness || input.finalScriptSig,
    );
    if (!allFinalized) {
      psbt.finalizeAllInputs();
    }

    return psbt.toHex();
  };

  signPsbts = async (psbtsHexes: string[]): Promise<string[]> => {
    if (!psbtsHexes && !Array.isArray(psbtsHexes)) {
      throw new Error("params error");
    }
    const options = psbtsHexes.map((_) => {
      return {
        autoFinalized: true,
      };
    });
    const data = {
      method: "signPsbt",
      params: {
        from: this.bitcoinNetworkProvider.selectedAddress,
        __internalFunc: "__signPsbts_babylon",
        psbtHex: "_",
        psbtHexs: psbtsHexes,
        options,
      },
    };

    try {
      let signedPsbts = await this.bitcoinNetworkProvider.request(
        "dappsSign",
        data,
      );
      signedPsbts = signedPsbts.split(",");
      return signedPsbts.map((tx: string) => {
        let psbt = Psbt.fromHex(tx);

        const allFinalized = psbt.data.inputs.every(
          (input) => input.finalScriptWitness || input.finalScriptSig,
        );
        if (!allFinalized) {
          psbt.finalizeAllInputs();
        }

        return psbt.toHex();
      });
    } catch (error) {
      throw new Error((error as Error)?.message);
    }
  };

  signMessageBIP322 = async (message: string): Promise<string> => {
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
}
