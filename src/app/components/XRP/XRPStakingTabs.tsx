import React, { useState } from "react";

import { useLanguage } from "@/app/contexts/LanguageContext";
import { translations } from "@/app/translations";

export const XRPStakingTabs: React.FC = () => {
  const { language } = useLanguage();
  const t = translations[language];
  const [activeTab, setActiveTab] = useState("stake");

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mt-8">
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
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
              activeTab === "unstake"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            onClick={() => setActiveTab("unstake")}
          >
            {t.unstake}
          </button>
        </nav>
      </div>
      <div className="mt-4">
        <div className="text-center text-gray-500 py-8">
          {t.walletNotConnected.description}
        </div>
      </div>
    </div>
  );
};
