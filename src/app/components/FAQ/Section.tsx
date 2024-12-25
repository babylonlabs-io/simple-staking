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
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <motion.p
              className="mt-4"
              dangerouslySetInnerHTML={{ __html: content }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
