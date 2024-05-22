import { OKXWallet } from "./providers/okx_wallet";
import okxIcon from "./icons/okx.svg";
import onekeyIcon from "./icons/onekey.svg";
import { OneKeyWallet } from "./onekey_wallet";

export const walletList = [
  {
    name: "OKX",
    icon: okxIcon,
    wallet: OKXWallet,
  },
  {
    name: "OneKey",
    icon: onekeyIcon,
    wallet: OneKeyWallet
  }
];
