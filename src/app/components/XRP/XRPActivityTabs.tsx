import React, { useState } from "react";

import { useLanguage } from "@/app/contexts/LanguageContext";
import { translations } from "@/app/translations";

export const XRPActivityTabs: React.FC = () => {
  const { language } = useLanguage();
  const t = translations[language];
  const [activeTab, setActiveTab] = useState("all");

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mt-8">
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            className={`${
              activeTab === "all"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            onClick={() => setActiveTab("all")}
          >
            {t.all}
          </button>
          <button
            className={`${
              activeTab === "stake"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            onClick={() => setActiveTab("stake")}
          >
            {t.stake}
          </button>
          <button
            className={`${
              activeTab === "rewards"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            onClick={() => setActiveTab("rewards")}
          >
            {t.rewards}
          </button>
        </nav>
      </div>
      <div className="mt-4">
        <div className="text-center text-gray-500 py-8">
          {t.noDelegations.description}
        </div>
      </div>
    </div>
  );
};
