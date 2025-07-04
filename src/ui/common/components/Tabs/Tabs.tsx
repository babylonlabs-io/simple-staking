import { ReactNode, useState } from "react";
import { twMerge } from "tailwind-merge";

interface TabItem {
  id: string;
  label: string;
  content: ReactNode;
}

interface TabsProps {
  items: TabItem[];
  defaultActiveTab?: string;
  className?: string;
}

export const Tabs = ({ items, defaultActiveTab, className }: TabsProps) => {
  const [activeTab, setActiveTab] = useState(
    defaultActiveTab || items[0]?.id || "",
  );

  const activeContent = items.find((item) => item.id === activeTab)?.content;

  return (
    <div className={twMerge("w-full", className)}>
      <div className="flex gap-2 w-full">
        {items.map((item) => (
          <button
            key={item.id}
            className={twMerge(
              "px-4 py-2 rounded transition-colors duration-200 text-primary",
              activeTab === item.id
                ? "bg-secondary-highlight"
                : "bg-transparent",
            )}
            onClick={() => setActiveTab(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="mt-6">{activeContent}</div>
    </div>
  );
};
