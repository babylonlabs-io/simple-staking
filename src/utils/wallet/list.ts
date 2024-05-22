import { OKXWallet, okxProvider } from "./providers/okx_wallet";
import okxIcon from "./icons/okx.svg";

export const walletList = [
  {
    name: "OKX",
    icon: okxIcon,
    wallet: OKXWallet,
    provider: okxProvider,
    linkToDocs: "https://www.okx.com/web3",
  },
];
