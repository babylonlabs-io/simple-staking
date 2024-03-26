import { WalletProvider } from "./wallet/wallet_provider";

export {};

declare global {
  interface Window {
    btc: any;
    keplr: any;
    okxwallet: any;
    btcwallet: WalletProvider;
  }
}
