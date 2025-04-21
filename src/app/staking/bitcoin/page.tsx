"use client";

import { initBTCCurve } from "@babylonlabs-io/btc-staking-ts";
import { useWalletConnect } from "@babylonlabs-io/wallet-connector";
import { useEffect } from "react";

import { Container } from "../../components/Container/Container";
import { LoginScreen } from "../../components/Login/LoginScreen";
import { PersonalBalance } from "../../components/PersonalBalance/PersonalBalance";
import { PersonalBalanceStaked } from "../../components/PersonalBalance/PersonalBalanceStaked";
import { WalletNotConnected } from "../../components/Staking/Form/States/WalletNotConnected";
import { ActivityTabs } from "../../components/Tabs/ActivityTabs";
import { StakingTabs } from "../../components/Tabs/StakingTabs";
import { useAuth } from "../../contexts/AuthContext";
import { useLanguage } from "../../contexts/LanguageContext";
import { translations } from "../../translations";

const getBabylonDescription = (language: string) => {
  switch (language) {
    case "en":
      return "Babylon Protocol is a revolutionary blockchain protocol that enables Bitcoin holders to stake their BTC and earn rewards while maintaining custody of their assets. It provides a secure and efficient way to participate in Proof-of-Stake networks using Bitcoin as collateral.";
    case "ko":
      return "바빌론 프로토콜은 비트코인 보유자가 자산의 보관권을 유지하면서 BTC를 스테이킹하고 보상을 받을 수 있게 하는 혁신적인 블록체인 프로토콜입니다. 비트코인을 담보로 사용하여 지분증명 네트워크에 안전하고 효율적으로 참여할 수 있는 방법을 제공합니다.";
    case "jp":
      return "バビロンプロトコルは、ビットコイン保有者が資産の保管権を維持しながらBTCをステーキングして報酬を得ることができる革新的なブロックチェーンプロトコルです。ビットコインを担保として使用して、プルーフ・オブ・ステークネットワークに安全かつ効率的に参加する方法を提供します。";
    default:
      return "Babylon Protocol is a revolutionary blockchain protocol that enables Bitcoin holders to stake their BTC and earn rewards while maintaining custody of their assets. It provides a secure and efficient way to participate in Proof-of-Stake networks using Bitcoin as collateral.";
  }
};

export default function BitcoinStaking() {
  const { user } = useAuth();
  const { connected } = useWalletConnect();
  const { language } = useLanguage();

  useEffect(() => {
    initBTCCurve();
  }, []);

  if (!user) {
    return <LoginScreen />;
  }

  return (
    <Container
      as="main"
      className="flex flex-col gap-12 md:gap-16 pb-20 pt-24 flex-1 justify-center"
    >
      {connected ? (
        <div className="flex flex-col gap-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <PersonalBalance />
            <PersonalBalanceStaked />
          </div>
          <StakingTabs />
          <ActivityTabs />
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
            <WalletNotConnected />
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
                  {getBabylonDescription(language)}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </Container>
  );
}
