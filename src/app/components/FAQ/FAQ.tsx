import { Section } from "./Section";
import { questions } from "./data/questions";

interface FAQProps {}

export const FAQ: React.FC<FAQProps> = () => {
  return (
    <div className="container mx-auto flex flex-col gap-2 p-6">
      <h3 className="mb-4 font-bold">FAQ</h3>
      <div className="flex flex-col gap-4">
        {questions.map((question) => (
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
