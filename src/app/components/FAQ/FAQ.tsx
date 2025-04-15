"use client";

import { Card } from "@babylonlabs-io/core-ui";

import { Section as SectionContainer } from "@/app/components/Section/Section";
import { useLanguage } from "@/app/hooks/useLanguage";
import { translations } from "@/app/translations";
import { getNetworkConfigBTC } from "@/config/network/btc";

import { useQuestions } from "./data/questions";
import { Question } from "./Question";

interface FAQProps {}

export const FAQ: React.FC<FAQProps> = () => {
  const { coinName } = getNetworkConfigBTC();
  const { language } = useLanguage();
  const t = translations[language];
  const questions = useQuestions(coinName);

  const questionsArray = [
    {
      question: t.whatIsBabylon,
      answer: t.whatIsBabylonContent,
    },
    {
      question: t.howDoesStakingWork,
      answer: t.howDoesStakingWorkContent,
    },
    {
      question: t.whatCanStakingAppDo,
      answer: t.whatCanStakingAppDoContent,
    },
    {
      question: t.doesBtcLeaveWallet,
      answer: t.doesBtcLeaveWalletContent,
    },
    {
      question: t.otherWaysToStake,
      answer: t.otherWaysToStakeContent,
    },
  ];

  return (
    <SectionContainer title={t.faqTitle}>
      <Card className="flex flex-col gap-4 divide-y">
        {questionsArray.map((q, index) => (
          <Question key={index} question={q.question} answer={q.answer} />
        ))}
      </Card>
    </SectionContainer>
  );
};
