import { useState } from "react";

import { getNetworkConfig } from "@/config/network.config";

import { Section } from "./Section";
import { questions } from "./data/questions";

interface FAQProps {}

export const FAQ: React.FC<FAQProps> = () => {
  const { coinName } = getNetworkConfig();

  const [openSection, setOpenSection] = useState<string | null>(
    questions(coinName).length > 0 ? questions(coinName)[0].title : null,
  );

  const handleSectionClick = (title: string) => {
    setOpenSection(openSection === title ? null : title);
  };
  return (
    <div className="container mx-auto flex flex-col gap-2 p-6">
      <h3 className="mb-4 font-bold text-[88px] text-bold">FAQ</h3>
      <div className="flex flex-col">
        {questions(coinName).map((question) => (
          <Section
            key={question.title}
            title={question.title}
            content={question.content}
            isOpen={openSection === question.title}
            onClick={() => handleSectionClick(question.title)}
          />
        ))}
      </div>
    </div>
  );
};
