import { Heading, List } from "@babylonlabs-io/core-ui";
import { twMerge } from "tailwind-merge";

import { useLanguage } from "@/app/contexts/LanguageContext";
import { useXrp } from "@/app/contexts/XrpProvider";
import { translations } from "@/app/translations";

import { StatItem } from "../Stats/StatItem";

export const XRPPersonalBalance = () => {
  const {
    xrpBalance,
    loadingXrpBalance,
    stakedBalance,
    loadingStakedBalance,
    getStakedInfo,
    getXrpAddress,
    xrpAddress,
    getXrpBalance,
  } = useXrp();
  const { language } = useLanguage();
  const t = translations[language];

  const handleClickRefresh = () => {
    if (!xrpAddress) {
      getXrpAddress();
    } else {
      getStakedInfo();
      getXrpBalance();
    }
  };

  return (
    <section>
      <Heading
        as="h3"
        variant="h5"
        className={twMerge(
          "text-accent-primary capitalize md:text-[2.125rem] md:leading-[2.625rem] md:tracking-0.25",
          "md:text-3xl font-semiBold",
        )}
        style={{
          display: "flex",
          gap: "1rem",
          alignItems: "center",
          paddingBottom: "0.5rem",
          borderBottom: "1px solid",
          borderImage:
            "linear-gradient(90deg, #4F4633 -16.24%, #887957 34%, #060504 97.34%) 1",
        }}
      >
        {"XRP Balance"}
        <button
          onClick={handleClickRefresh}
          className="p-2 hover:bg-secondary-strokeLight rounded-full transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-accent-primary"
          >
            <path d="M21 2v6h-6"></path>
            <path d="M3 12a9 9 0 0 1 15-6.7L21 8"></path>
            <path d="M3 22v-6h6"></path>
            <path d="M21 12a9 9 0 0 1-15 6.7L3 16"></path>
          </svg>
        </button>
      </Heading>

      <List orientation="horizontal" className="border-0 pt-4">
        <StatItem
          loading={loadingStakedBalance}
          title={t.stakedBalance}
          value={`${stakedBalance} xrp`}
          className="flex-col items-start border-b-0 p-0 gap-2"
        />

        <StatItem
          loading={loadingXrpBalance}
          title={t.stakableBalance}
          // loadingStyle={
          //   hasUnconfirmedUTXOs
          //     ? LoadingStyle.ShowSpinnerAndValue
          //     : LoadingStyle.ShowSpinner
          // }
          value={`${xrpBalance} xrp`}
          // tooltip={
          //   inscriptionsBtcBalance
          //     ? `You have ${satoshiToBtc(inscriptionsBtcBalance)} ${coinSymbol} that contains inscriptions. To use this in your stakable balance unlock them within the menu.`
          //     : undefined
          // }
          className="flex-col items-start border-b-0 gap-2"
        />
      </List>
    </section>
  );
};
