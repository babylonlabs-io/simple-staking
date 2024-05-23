import { OKXWallet, okxProvider } from "./providers/okx_wallet";
import { OneKeyWallet, oneKeyProvider } from "./providers/onekey_wallet";
import { BitgetWallet, bitgetWalletProvider } from "./providers/bitget_wallet";
import okxIcon from "./icons/okx.svg";
import oneKeyIcon from "./icons/onekey.svg";
import bitgetWalletIcon from "./icons/bitget-wallet.svg";

interface IntegratedWallet {
  name: string;
  icon: string;
  wallet: any;
  linkToDocs: string;
  provider?: string;
  isQRWallet?: boolean;
}

export const walletList: IntegratedWallet[] = [
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
  },
  {
    name: "Bitget Wallet",
    icon: bitgetWalletIcon,
    wallet: BitgetWallet,
    provider: bitgetWalletProvider,
    linkToDocs: "https://web3.bitget.com",
  },
];
