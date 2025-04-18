import { Button, Heading, Text } from "@babylonlabs-io/core-ui";
import Image from "next/image";

import { useBTCWallet } from "@/app/context/wallet/BTCWalletProvider";
import { useLanguage } from "@/app/contexts/LanguageContext";
import { translations } from "@/app/translations";
import { getNetworkConfigBTC } from "@/config/network/btc";

import walletIcon from "./wallet-icon-secure.svg";

export const WalletNotConnected = () => {
  const { open } = useBTCWallet();
  const { coinName } = getNetworkConfigBTC();
  const { language } = useLanguage();
  const t = translations[language].walletNotConnected;

  return (
    <div className="flex flex-1 flex-row items-center justify-center gap-8">
      <div>
        <Image src={walletIcon} alt="Wallet" width={185} height={144} />
      </div>

      <div className="text-start gap-4 flex flex-col items-start">
        <Heading variant="h5" className="text-accent-primary text-2xl mb-2">
          {t.title}
        </Heading>
        <Text
          variant="body1"
          className="text-start text-base text-accent-secondary p-0"
        >
          {t.description.replace("{coinName}", coinName)}
        </Text>
        <Button
          variant="outlined"
          onClick={open}
          className="text-primary-dark"
          style={{
            border: "1px solid #EDD2A1",
          }}
        >
          {t.button}
        </Button>
      </div>
    </div>
  );
};
