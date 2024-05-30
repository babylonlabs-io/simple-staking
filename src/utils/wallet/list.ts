import bitgetWalletIcon from "./icons/bitget-wallet.svg";
import keystoneIcon from "./icons/keystone.svg";
import okxIcon from "./icons/okx.svg";
import oneKeyIcon from "./icons/onekey.svg";
import tomoIcon from "./icons/tomo.svg";
import { BitgetWallet, bitgetWalletProvider } from "./providers/bitget_wallet";
import { KeystoneWallet } from "./providers/keystone";
import { OKXWallet, okxProvider } from "./providers/okx_wallet";
import { OneKeyWallet, oneKeyProvider } from "./providers/onekey_wallet";
import { TomoWallet, tomoProvider } from "./providers/tomo_wallet";

interface IntegratedWallet {
  name: string;
  icon: string;
  wallet: any;
  linkToDocs: string;
  provider?: string;
  isQRWallet?: boolean;
}

// Special case for the browser wallet. i.e injected wallet
export const BROWSER_INJECTED_WALLET_NAME = "Browser";

export const walletList: IntegratedWallet[] = [
  {
    name: "OKX",
    icon: okxIcon,
    wallet: OKXWallet,
    provider: okxProvider,
    linkToDocs: "https://www.okx.com/web3",
  },
  {
    name: BROWSER_INJECTED_WALLET_NAME,
    icon: "",
    wallet: "",
    provider: "",
    linkToDocs: "",
  },
  {
    name: "Tomo",
    icon: tomoIcon,
    wallet: TomoWallet,
    provider: tomoProvider,
    linkToDocs: "https://tomo.inc/",
  },
  {
    name: "OneKey",
    icon: oneKeyIcon,
    wallet: OneKeyWallet,
    provider: oneKeyProvider,
    linkToDocs: "https://onekey.so/download",
  },
  {
    name: "Bitget Wallet",
    icon: bitgetWalletIcon,
    wallet: BitgetWallet,
    provider: bitgetWalletProvider,
    linkToDocs: "https://web3.bitget.com",
  },
  {
    name: "Keystone",
    icon: keystoneIcon,
    wallet: KeystoneWallet,
    linkToDocs: "https://www.keyst.one/btc-only",
    isQRWallet: true,
  },
];
