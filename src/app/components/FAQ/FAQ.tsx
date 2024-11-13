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
      <h3 className="mb-4 font-bold">FAQ</h3>
      <div className="flex flex-col gap-4">
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
