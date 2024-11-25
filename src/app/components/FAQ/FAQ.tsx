import { getNetworkConfig } from "@/config/network.config";

import { questions } from "./data/questions";
import { Section } from "./Section";

interface FAQProps {}

export const FAQ: React.FC<FAQProps> = () => {
  const { coinName, networkName } = getNetworkConfig();
  // TODO: To be handled by https://github.com/babylonlabs-io/simple-staking/issues/325
  const confirmationDepth = 10;

  return (
    <div className="container mx-auto flex flex-col gap-2 p-6">
      <Heading as="h3" variant="h4" className="mb-8">FAQ’s</Heading>
      <div className="flex flex-col gap-4 bg-warning-contrast border border-primary-light/20 rounded divide-y p-6">
        {questions(coinName, networkName, confirmationDepth).map((question) => (
          <Section
            key={question.title}
            title={question.title}
            content={question.content}
          />
        ))}
      </div>
    </div>
  );
};
