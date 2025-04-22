"use client";

import { Button, Heading, Text } from "@babylonlabs-io/core-ui";
import { usePrivy } from "@privy-io/react-auth";
import Image from "next/image";

import { Container } from "@/app/components/Container/Container";
import walletIcon from "@/app/components/Staking/Form/States/wallet-icon-secure.svg";
import { XRPActivityTabs } from "@/app/components/XRP/XRPActivityTabs";
import { XRPPersonalBalance } from "@/app/components/XRP/XRPPersonalBalance";
import { XRPStakingTabs } from "@/app/components/XRP/XRPStakingTabs";
import { useLanguage } from "@/app/contexts/LanguageContext";
import { translations } from "@/app/translations";

const getXRPDescription = (language: string) => {
  switch (language) {
    case "en":
      return "XRP is a digital asset built for payments. It is the native cryptocurrency of the XRP Ledger, a decentralized, open-source blockchain technology that can settle transactions in 3-5 seconds.";
    case "ko":
      return "XRP는 결제를 위해 설계된 디지털 자산입니다. XRP Ledger의 기본 암호화폐로, 3-5초 내에 거래를 완료할 수 있는 탈중앙화 오픈소스 블록체인 기술입니다.";
    case "jp":
      return "XRPは決済のために設計されたデジタル資産です。XRP Ledgerのネイティブ暗号通貨で、3-5秒で取引を完了できる分散型オープンソースブロックチェーン技術です。";
    default:
      return "XRP is a digital asset built for payments. It is the native cryptocurrency of the XRP Ledger, a decentralized, open-source blockchain technology that can settle transactions in 3-5 seconds.";
  }
};

export default function XRPStaking() {
  const { user, login } = usePrivy();
  const { language } = useLanguage();
  const t = translations[language].walletNotConnected;

  const handleConnectXrp = () => {
    login({ loginMethods: ["google"] });
  };

  return (
    <Container
      as="main"
      // className="-mt-[10rem] md:-mt-[6.5rem] flex flex-col gap-12 md:gap-16 pb-16"
      className="flex flex-col gap-12 md:gap-16 pb-20 pt-24 flex-1 justify-center"
    >
      {user ? (
        <div className="flex flex-col gap-16">
          {/* {!xrpAddress && (
            <div className="flex flex-row gap-4">
              <span>{xrpAddress}</span>
              <button onClick={() => getXrpAddress()}>get xrp address</button>
            </div>
          )} */}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <XRPPersonalBalance />
          </div>
          <XRPStakingTabs />
          <XRPActivityTabs />
        </div>
      ) : (
        <div className="hidden md:flex flex-1 justify-center items-center flex-col">
          <div
            className="px-[404px] py-[100px]"
            style={{
              borderLeft: "1px solid",
              borderRight: "1px solid",
              borderImage:
                "linear-gradient(to bottom, hsla(60, 14%, 1%, 1), hsla(42, 22%, 44%, 1), hsla(30, 20%, 2%, 1)) 1",
            }}
          >
            <div className="flex flex-1 flex-row items-center justify-center gap-8">
              <div>
                <Image src={walletIcon} alt="Wallet" width={185} height={144} />
              </div>

              <div className="text-start gap-4 flex flex-col items-start">
                <Heading
                  variant="h5"
                  className="text-accent-primary text-2xl mb-2"
                >
                  {t.title}
                </Heading>
                <Text
                  variant="body1"
                  className="text-start text-base text-accent-secondary p-0"
                >
                  {t.description.replace("{coinName}", "xrp")}
                </Text>
                <Button
                  variant="outlined"
                  onClick={handleConnectXrp}
                  className="text-primary-dark"
                  style={{
                    border: "1px solid #EDD2A1",
                  }}
                >
                  {t.button}
                </Button>
              </div>
            </div>
          </div>
          <div className="gap-20 flex flex-col items-start">
            <div className="grid grid-cols-2 gap-4">
              <span className="text-white text-sm font-medium">
                {translations[language].dsrvDescription1}
              </span>
              <span className="text-white text-sm font-medium">
                {translations[language].dsrvDescription2}
              </span>
            </div>
            <div className="flex flex-col gap-4">
              <span className="text-white text-2xl font-medium">
                {`Babylon?`}
              </span>
              <div className="h-px w-full bg-secondary-strokeLight" />
              <div className="grid grid-cols-2 gap-4">
                <span className="text-white text-sm font-medium">
                  {getXRPDescription(language)}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </Container>
  );
}
