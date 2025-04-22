import { List } from "@babylonlabs-io/core-ui";
import { FC, useEffect } from "react";

import { useLanguage } from "@/app/contexts/LanguageContext";
import { useXrp } from "@/app/contexts/XrpProvider";
import { translations } from "@/app/translations";

import { Section } from "../Section/Section";
import { StatItem } from "../Stats/StatItem";

interface XRPPersonalBalanceProps {
  stakedBalance: number;
}

export const XRPPersonalBalance: FC<XRPPersonalBalanceProps> = ({
  stakedBalance,
}) => {
  const { getXrpAddress, xrpBalance } = useXrp();
  const { language } = useLanguage();
  const t = translations[language];

  useEffect(() => {
    getXrpAddress();
  }, []);

  return (
    <Section title={"XRP Balance"} titleClassName="md:text-3xl font-semiBold">
      <List orientation="horizontal" className="border-0 pt-4">
        <StatItem
          // loading={isBalanceLoading}
          title={t.stakedBalance}
          value={`${stakedBalance} xrp`}
          className="flex-col items-start border-b-0 p-0 gap-2"
        />

        <StatItem
          // loading={isBalanceLoading || hasUnconfirmedUTXOs}
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
    </Section>
  );
};
