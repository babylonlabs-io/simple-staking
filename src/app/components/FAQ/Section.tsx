import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { FaMinus, FaPlus } from "react-icons/fa";

interface SectionProps {
  title: string;
  content: string;
  isOpen: boolean;
  onClick: () => void;
}

export const Section: React.FC<SectionProps> = ({
  title,
  content,
  isOpen,
  onClick,
}) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const [maxHeight, setMaxHeight] = useState("0px");
  useEffect(() => {
    if (isOpen) {
      const contentHeight = contentRef.current
        ? `${contentRef.current.scrollHeight + 28}px`
        : "0px"; // 28 = parent padding
      setMaxHeight(contentHeight);
    } else {
      setMaxHeight("0px");
    }
  }, [isOpen]);
  return (
    <div
      className={`card cursor-pointer p-8 rounded-none border transition-colors ${isOpen ? "border-es-accent" : "border-[#5b5b5b]"}`}
      onClick={() => onClick()}
    >
      <div className="flex items-center justify-between">
        <h4
          className={`font-bold text-lg uppercase ${isOpen ? "text-es-accent" : ""}`}
        >
          {title}
        </h4>
        <button
          className={`btn btn-square btn-sm bg-transparent border-0 ${isOpen ? "" : ""}`}
        >
          {isOpen ? <FaMinus fill="#F5BE37" /> : <FaPlus />}
        </button>
      </div>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ maxHeight: "0px" }}
            animate={{ maxHeight }}
            exit={{ maxHeight: "0px" }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div ref={contentRef}>
              <div
                className="mt-4 text-sm"
                dangerouslySetInnerHTML={{ __html: content }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
