import { OKXWallet, okxProvider } from "./providers/okx_wallet";
import okxIcon from "./icons/okx.svg";
import oneKeyIcon from "./icons/onekey.svg";
import { OneKeyWallet, oneKeyProvider } from "./providers/onekey_wallet";

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
    icon: oneKeyIcon,
    wallet: OneKeyWallet,
    provider: oneKeyProvider,
    linkToDocs: 'https://onekey.so/download'  
  }
];
