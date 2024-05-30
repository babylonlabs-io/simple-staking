import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { FaMinus, FaPlus } from "react-icons/fa";

interface SectionProps {
  title: string;
  content: string;
}

export const Section: React.FC<SectionProps> = ({ title, content }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div
      className="card cursor-pointer border bg-base-300 p-4 dark:border-0"
      onClick={() => setIsOpen(!isOpen)}
    >
      <div className="flex items-center justify-between">
        <h4 className="font-bold">{title}</h4>
        <button className="btn btn-square btn-sm border border-neutral-content bg-transparent">
          {isOpen ? <FaMinus /> : <FaPlus />}
        </button>
      </div>
      <AnimatePresence>
        {isOpen && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="mt-4"
            dangerouslySetInnerHTML={{ __html: content }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};
