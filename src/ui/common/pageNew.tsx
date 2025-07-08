import { initBTCCurve } from "@babylonlabs-io/btc-staking-ts";
import { useWalletConnect } from "@babylonlabs-io/wallet-connector";
import { useEffect } from "react";

import { useHealthCheck } from "@/ui/common/hooks/useHealthCheck";

import { Banner } from "./components/Banner/Banner";
import { Container } from "./components/Container/Container";
import { Activity } from "./components/Delegations/Activity";
import { FAQ } from "./components/FAQ/FAQ";
import { Footer } from "./components/Footer/Footer";
import { Header } from "./components/Header/Header";
import { MultistakingFormWrapper } from "./components/Multistaking/MultistakingForm/MultistakingFormWrapper";
import { PersonalBalance } from "./components/PersonalBalance/PersonalBalance";
import { Stats } from "./components/Stats/Stats";
import { Tabs } from "./components/Tabs";

const Home = () => {
  useEffect(() => {
    initBTCCurve();
  }, []);

  const { connected } = useWalletConnect();
  const { isGeoBlocked, isLoading } = useHealthCheck();
  const isConnected = connected && !isGeoBlocked && !isLoading;

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
        <Tabs items={tabItems} defaultActiveTab="stake" />
      </Container>

      <Footer />
    </>
  );
};

export default Home;
