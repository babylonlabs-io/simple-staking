// @ts-ignore
import bitgetWalletIcon from "./icons/bitget.svg";
// @ts-ignore
import keystoneIcon from "./icons/keystone.svg";
// @ts-ignore
import okxIcon from "./icons/okx.svg";
// @ts-ignore
import oneKeyIcon from "./icons/onekey.svg";
// @ts-ignore
import tomoIcon from "./icons/tomo.svg";

import { BitgetWallet, bitgetWalletProvider } from "./providers/bitget_wallet";
import { OKXWallet, okxProvider } from "./providers/okx_wallet";
import { OneKeyWallet, oneKeyProvider } from "./providers/onekey_wallet";
import { TomoWallet, tomoProvider } from "./providers/tomo_wallet";
import { Network } from "./wallet_provider";

interface IntegratedWallet {
  name: string;
  icon: string;
  wallet: any;
  linkToDocs: string;
  provider?: string;
  isQRWallet?: boolean;
  supportedNetworks?: Network[];
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
    supportedNetworks: [Network.MAINNET, Network.SIGNET],
  },
  {
    name: BROWSER_INJECTED_WALLET_NAME,
    icon: "",
    wallet: "",
    provider: "",
    linkToDocs: "",
    supportedNetworks: [Network.MAINNET, Network.SIGNET],
  },
  {
    name: "Tomo",
    icon: tomoIcon,
    wallet: TomoWallet,
    provider: tomoProvider,
    linkToDocs: "https://tomo.inc/",
    supportedNetworks: [Network.MAINNET, Network.SIGNET],
  },
  {
    name: "OneKey",
    icon: oneKeyIcon,
    wallet: OneKeyWallet,
    provider: oneKeyProvider,
    linkToDocs: "https://onekey.so/download",
    supportedNetworks: [Network.MAINNET, Network.SIGNET],
  },
  {
    name: "Bitget Wallet",
    icon: bitgetWalletIcon,
    wallet: BitgetWallet,
    provider: bitgetWalletProvider,
    linkToDocs: "https://web3.bitget.com",
    supportedNetworks: [Network.MAINNET, Network.SIGNET],
  },
  {
    name: "Keystone",
    icon: keystoneIcon,
    wallet: null,
    linkToDocs: "https://www.keyst.one/btc-only",
    isQRWallet: true,
    supportedNetworks: [Network.MAINNET, Network.SIGNET],
  },
];
