import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Heading,
  Text,
} from "@babylonlabs-io/core-ui";
import { ReactNode } from "react";
import { AiOutlineMinus, AiOutlinePlus } from "react-icons/ai";

interface SectionProps {
  title: string;
  content: ReactNode;
}

export const Section: React.FC<SectionProps> = ({ title, content }) => {
  return (
    <div className="border-secondary-strokeDark pt-6 first:pt-0 pb-2 first:pb-0">
      <Accordion className="text-primary-dark">
        <AccordionSummary
          renderIcon={(expanded) =>
            expanded ? (
              <AiOutlineMinus size={24} />
            ) : (
              <AiOutlinePlus size={24} />
            )
          }
        >
          <Heading variant="h6">
            <span className="align-middle">{title}</span>
          </Heading>
        </AccordionSummary>
        <AccordionDetails className="p-2" unmountOnExit>
          <Text as="div">{content}</Text>
        </AccordionDetails>
      </Accordion>
    </div>
  );
};
