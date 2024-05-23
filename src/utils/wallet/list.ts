import { OKXWallet, okxProvider } from "./providers/okx_wallet";
import okxIcon from "./icons/okx.svg";
import onekeyIcon from "./icons/onekey.svg";
import { OneKeyWallet } from "./onekey_wallet";

export const walletList = [
  {
    name: "OKX",
    icon: okxIcon,
    wallet: OKXWallet,
    provider: okxProvider,
    linkToDocs: "https://www.okx.com/web3",
  },
  {
    name: "OneKey",
    icon: onekeyIcon,
    wallet: OneKeyWallet
  }
];
