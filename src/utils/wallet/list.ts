import { OKXWallet, okxProvider } from "./providers/okx_wallet";
import okxIcon from "./icons/okx.svg";
import tomoIcon from "./icons/tomo.png";
import { TomoWallet, tomoProvider } from "./providers/tomo_wallet";

export const walletList = [
  {
    name: "OKX",
    icon: okxIcon,
    wallet: OKXWallet,
    provider: okxProvider,
    linkToDocs: "https://www.okx.com/web3",
  },
  {
    name: "Tomo",
    icon: tomoIcon,
    wallet: TomoWallet,
    provider: tomoProvider,
    linkToDocs: "https://tomo.inc/",
  },
];
