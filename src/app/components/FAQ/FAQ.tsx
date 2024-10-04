import { useVersionInfo } from "@/app/context/api/VersionInfo";
import { getNetworkConfig } from "@/config/network.config";

import { questions } from "./data/questions";
import { Section } from "./Section";

interface FAQProps {}

export const FAQ: React.FC<FAQProps> = () => {
  const { coinName, networkName } = getNetworkConfig();
  const versionInfo = useVersionInfo();

  return (
    <div className="container mx-auto flex flex-col gap-2 p-6">
      <h3 className="mb-4 font-bold">FAQ</h3>
      <div className="flex flex-col gap-4">
        {questions(
          coinName,
          networkName,
          versionInfo?.currentVersion?.confirmationDepth,
        ).map((question) => (
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
