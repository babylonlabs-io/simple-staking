import { initBTCCurve } from "@babylonlabs-io/btc-staking-ts";
import { useWalletConnect } from "@babylonlabs-io/wallet-connector";
import { useEffect, useState } from "react";

import { useHealthCheck } from "@/ui/common/hooks/useHealthCheck";

import { Activity } from "./components/Activity/Activity";
import { Banner } from "./components/Banner/Banner";
import { Container } from "./components/Container/Container";
import { FAQ } from "./components/FAQ/FAQ";
import { Footer } from "./components/Footer/Footer";
import { Header } from "./components/Header/Header";
import { MultistakingFormWrapper } from "./components/Multistaking/MultistakingForm/MultistakingFormWrapper";
import { PersonalBalance } from "./components/PersonalBalance/PersonalBalance";
import { Stats } from "./components/Stats/Stats";
import { Tabs } from "./components/Tabs";

const Home = () => {
  const [activeTab, setActiveTab] = useState("stake");

  useEffect(() => {
    initBTCCurve();
  }, []);

  const { connected } = useWalletConnect();
  const { isGeoBlocked, isLoading } = useHealthCheck();
  const isConnected = connected && !isGeoBlocked && !isLoading;

  // Reset tab to "stake" when wallet disconnects
  useEffect(() => {
    if (!connected) {
      setActiveTab("stake");
    }
  }, [connected]);

  const tabItems = [
    {
      id: "stake",
      label: "Stake",
      content: <MultistakingFormWrapper />,
    },
    ...(isConnected
      ? [
          {
            id: "balances",
            label: "Balances",
            content: <PersonalBalance />,
          },
          {
            id: "activity",
            label: "Activity",
            content: <Activity />,
          },
        ]
      : []),
    {
      id: "faqs",
      label: "FAQs",
      content: <FAQ />,
    },
  ];

  return (
    <>
      <Banner />
      <Header />

      <Container
        as="main"
        className="-mt-[10rem] flex flex-col gap-[3rem] pb-16 max-w-[760px] mx-auto"
      >
        <Stats />
        <Tabs
          items={tabItems}
          defaultActiveTab="stake"
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
      </Container>

      <Footer />
    </>
  );
};

export default Home;
