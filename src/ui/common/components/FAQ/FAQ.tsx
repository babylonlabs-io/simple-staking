import { Card } from "@babylonlabs-io/core-ui";

import { Section as SectionContainer } from "@/ui/common/components/Section/Section";
import { getNetworkConfigBTC } from "@/ui/common/config/network/btc";

import { questions } from "./data/questions";
import { Section } from "./Section";

export const FAQ = () => {
  const { coinName } = getNetworkConfigBTC();

  return (
    <SectionContainer title="FAQs" titleClassName="md:text-[1.25rem] mt-10">
      <Card className="flex flex-col gap-4 divide-y bg-secondary-highlight">
        {questions(coinName).map((question) => (
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
