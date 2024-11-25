import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Heading,
  Text,
} from "@babylonlabs-io/bbn-core-ui";
import { AiOutlineMinus, AiOutlinePlus } from "react-icons/ai";

interface SectionProps {
  title: string;
  content: string;
}

export const Section: React.FC<SectionProps> = ({ title, content }) => {
  return (
    <div className="cursor-pointer border-primary-light/20 pt-6 first:pt-0 pb-2 first:pb-0">
      <Accordion className="text-primary">
        <AccordionSummary
          className="p-2 text-xl flex justify-between"
          renderIcon={(expanded) => (
            <div className="rounded border border-primary-light text-primary-light p-2">
              {expanded ? (
                <AiOutlineMinus size={24} />
              ) : (
                <AiOutlinePlus size={24} />
              )}
            </div>
          )}
        >
          <Heading variant="h6">
            <span className="align-middle">{title}</span>
          </Heading>
        </AccordionSummary>
        <AccordionDetails className="p-2" unmountOnExit>
          <Text>{content}</Text>
        </AccordionDetails>
      </Accordion>
    </div>
  );
};
