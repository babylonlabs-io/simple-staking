import { Card } from "@babylonlabs-io/bbn-core-ui";

import { Section as SectionContainer } from "@/app/components/Section/Section";
import { getNetworkConfigBTC } from "@/config/network/btc";

import { questions } from "./data/questions";
import { Section } from "./Section";

interface FAQProps {}

export const FAQ: React.FC<FAQProps> = () => {
  const { coinName } = getNetworkConfigBTC();

  return (
    <SectionContainer title="FAQ’s">
      <Card className="flex flex-col gap-4 divide-y">
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
