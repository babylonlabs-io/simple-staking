import { getAddressBalance, getFundingUTXOs, getNetworkFees, getTipHeight, pushTx } from "@/utils/mempool_api";
import { Fees, Network, UTXO, WalletProvider } from "../wallet_provider";

export const tomoProvider = "tomo_btc";

export class TomoWallet extends WalletProvider{

  constructor() {
    super();
  }

  connectWallet = async (): Promise<this> => {
    if (!window[tomoProvider]) {
      throw new Error("Tomo Wallet extension not found");
    }

    await window[tomoProvider].connectWallet()
    return this
  };

  getWalletProviderName = async (): Promise<string> => {
    return "Tomo";
  };

  getAddress = async (): Promise<string> => {
    return await window[tomoProvider].getAddress()
  };

  getPublicKeyHex = async (): Promise<string> => {
    return await window[tomoProvider].getPublicKeyHex();
  };

  signPsbt = async (psbtHex: string): Promise<string> => {
    // sign the PSBT
    return await window[tomoProvider].signPsbt(psbtHex);
  };

  signPsbts = async (psbtsHexes: string[]): Promise<string[]> => {
    // sign the PSBTs
    return await window[tomoProvider]?.signPsbts(psbtsHexes);
  };

  signMessageBIP322 = async (message: string): Promise<string> => {
    return await window[tomoProvider]?.signMessage(
      message,
      "bip322-simple",
    );
  };

  getNetwork = async (): Promise<Network> => {
    return "testnet";
  };

  on = (eventName: string, callBack: () => void) => {
    // subscribe to account change event
    if (eventName === "accountChanged") {
      return window[tomoProvider].on(eventName, callBack);
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
