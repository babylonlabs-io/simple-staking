import { Card } from "@babylonlabs-io/core-ui";

import { Section as SectionContainer } from "@/ui/common/components/Section/Section";
import { getNetworkConfigBTC } from "@/ui/common/config/network/btc";

import { Question, questionsBaby, questionsBtc } from "./data/questions";
import { Section } from "./Section";

type FaqVariant = "btc" | "baby";

interface FAQProps {
  variant: FaqVariant;
}

export const FAQ = ({ variant }: FAQProps) => {
  let items: Question[] = [];

  if (variant === "btc") {
    const { coinName } = getNetworkConfigBTC();
    items = questionsBtc(coinName);
  } else if (variant === "baby") {
    items = questionsBaby;
  }

  return (
    <SectionContainer titleClassName="md:text-[1.25rem] mt-10">
      <Card className="flex flex-col gap-4 divide-y bg-secondary-highlight !border-0">
        {items.map((question) => (
          <Section
            key={question.title}
            title={question.title}
            content={question.content}
          />
        ))}
      </Card>
    </SectionContainer>
  );
};
