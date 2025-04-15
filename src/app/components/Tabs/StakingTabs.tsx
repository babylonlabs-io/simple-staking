"use client";

import { useState } from "react";

import { useLanguage } from "@/app/contexts/LanguageContext";
import { translations } from "@/app/translations";

import { Activity } from "../Delegations/Activity";
import { StakingForm } from "../Staking/StakingForm";

export const StakingTabs = () => {
  const { language } = useLanguage();
  const t = translations[language];
  const [activeTab, setActiveTab] = useState<"staking" | "activity">("staking");

  return (
    <div className="flex-1 min-w-0">
      <div className="flex border-b border-gray-200">
        <button
          className={`px-4 py-2 text-sm font-medium ${
            activeTab === "staking"
              ? "border-b-2 border-primary-main text-primary-main"
              : "text-gray-500 hover:text-gray-700"
          }`}
          onClick={() => setActiveTab("staking")}
        >
          {t.stake}
        </button>
        <button
          className={`px-4 py-2 text-sm font-medium ${
            activeTab === "activity"
              ? "border-b-2 border-primary-main text-primary-main"
              : "text-gray-500 hover:text-gray-700"
          }`}
          onClick={() => setActiveTab("activity")}
        >
          {t.activity}
        </button>
      </div>
      <div className="mt-4">
        {activeTab === "staking" && <StakingForm />}
        {activeTab === "activity" && <Activity />}
      </div>
    </div>
  );
};
