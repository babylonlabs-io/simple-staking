import { WalletProvider, Network, Fees, UTXO } from "./wallet_provider";
import { getTipHeight } from "../mempool_api";

export class BitgetWallet extends WalletProvider {
  constructor() {
    super();
  }

  connectWallet = async (): Promise<any> => {
    // check whether there is an Bitget Wallet extension
    if (!window.btcwallet) {
      throw new Error("Bitget Wallet extension not found");
    }

    return window?.btcwallet?.connectWallet();
  };

  getWalletProviderName = async (): Promise<string> => {
    return window?.btcwallet?.getWalletProviderName();
  };

  getAddress = async (): Promise<string> => {
    return window?.btcwallet?.getAddress();
  };

  getPublicKeyHex = async (): Promise<string> => {
    return window?.btcwallet?.getPublicKeyHex();
  };

  signPsbt = async (psbtHex: string): Promise<string> => {
    return window?.btcwallet?.signPsbt(psbtHex);
  };

  signPsbts = async (psbtsHexes: string[]): Promise<string[]> => {
    return window?.btcwallet?.signPsbts(psbtsHexes);
  };

  signMessageBIP322 = async (message: string): Promise<string> => {
    return window?.btcwallet?.signMessageBIP322(message);
  };

  getNetwork = async (): Promise<Network> => {
    return window?.btcwallet?.getNetwork();
  };

  on = (eventName: string, callBack: () => void) => {
    return window?.btcwallet?.on(eventName, callBack);
  };

  getBalance = async (): Promise<number> => {
    return window?.btcwallet?.getBalance();
  };

  getNetworkFees = async (): Promise<Fees> => {
    return window?.btcwallet?.getNetworkFees();
  };

  pushTx = async (txHex: string): Promise<string> => {
    return window?.btcwallet?.pushTx(txHex);
  };

  getUtxos = async (address: string, amount: number): Promise<UTXO[]> => {
    return window?.btcwallet?.getUtxos(address, amount);
  };

  getBTCTipHeight = async (): Promise<number> => {
    return await getTipHeight();
  };
}
