import { ReactNode, useEffect, useState } from "react";
import { twMerge } from "tailwind-merge";

interface TabItem {
  id: string;
  label: string;
  content: ReactNode;
}

interface TabsProps {
  items: TabItem[];
  defaultActiveTab?: string;
  activeTab?: string;
  onTabChange?: (tabId: string) => void;
  className?: string;
  keepMounted?: boolean;
}

export const Tabs = ({
  items,
  defaultActiveTab,
  activeTab: controlledActiveTab,
  onTabChange,
  className,
  keepMounted,
}: TabsProps) => {
  const [internalActiveTab, setInternalActiveTab] = useState(
    defaultActiveTab || items[0]?.id || "",
  );

  const activeTab = controlledActiveTab ?? internalActiveTab;

  // Synchronizes the internal active tab state with the controlledActiveTab prop.
  useEffect(() => {
    if (controlledActiveTab !== undefined) {
      setInternalActiveTab(controlledActiveTab);
    }
  }, [controlledActiveTab]);

  const handleTabClick = (tabId: string) => {
    if (onTabChange) {
      onTabChange(tabId);
    } else {
      setInternalActiveTab(tabId);
    }
  };

  const activeContent = items.find((item) => item.id === activeTab)?.content;

  return (
    <div className={twMerge("w-full", className)}>
      <div className="flex gap-2 w-full" role="tablist">
        {items.map((item) => (
          <button
            key={item.id}
            id={`tab-${item.id}`}
            role="tab"
            aria-selected={activeTab === item.id}
            aria-controls={`panel-${item.id}`}
            tabIndex={activeTab === item.id ? 0 : -1}
            className={twMerge(
              "px-4 py-2 rounded transition-colors duration-200 text-primary",
              activeTab === item.id
                ? "bg-secondary-highlight"
                : "bg-transparent",
            )}
            onClick={() => handleTabClick(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>

      {keepMounted ? (
        <div className="mt-6 min-h-[450px]">
          {items.map((item) => (
            <div
              key={item.id}
              role="tabpanel"
              id={`panel-${item.id}`}
              aria-labelledby={`tab-${item.id}`}
              className={twMerge(activeTab === item.id ? "" : "hidden")}
            >
              {item.content}
            </div>
          ))}
        </div>
      ) : (
        <div
          className="mt-6 min-h-[450px]"
          role="tabpanel"
          id={`panel-${activeTab}`}
          aria-labelledby={`tab-${activeTab}`}
        >
          {activeContent}
        </div>
      )}
    </div>
  );
};
