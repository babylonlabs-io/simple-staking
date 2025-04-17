"use client";

import { useState } from "react";

import { useAuth } from "@/app/contexts/AuthContext";
import { useLanguage } from "@/app/contexts/LanguageContext";
import { useDelegationService } from "@/app/hooks/services/useDelegationService";
import { translations } from "@/app/translations";
import { DelegationV2StakingState as DelegationState } from "@/app/types/delegationsV2";
import { FinalityProviderState } from "@/app/types/finalityProviders";

import { Activity } from "../Delegations/Activity";
import { StakingForm } from "../Staking/StakingForm";

export const StakingTabs = () => {
  const { language } = useLanguage();
  const t = translations[language];
  const [activeTab, setActiveTab] = useState<"staking" | "activity">("staking");

  const { delegations } = useDelegationService();
  const { user } = useAuth();

  const activeDelegationsCount = delegations.filter(
    (delegation) =>
      delegation.fp?.state === FinalityProviderState.ACTIVE &&
      delegation.state === DelegationState.VERIFIED,
  ).length;

  console.log("activeDelegationsCount", activeDelegationsCount);

  return (
    <div className="flex-1 min-w-0">
      <div
        className="flex gap-4"
        style={{
          paddingBottom: "0.5rem",
          borderBottom: "1px solid",
          borderImage:
            "linear-gradient(90deg, #4F4633 -16.24%, #887957 34%, #060504 97.34%) 1",
        }}
      >
        <button
          className={`font-medium ${
            activeTab === "staking"
              ? "text-3xl text-accent-primary border-b-2 border-primary-main"
              : "text-xl text-gray-500 hover:text-gray-700"
          }`}
          onClick={() => setActiveTab("staking")}
        >
          {t.stake}
        </button>
        <button
          className={` font-medium relative ${
            activeTab === "activity"
              ? "text-3xl text-accent-primaryborder-b-2 border-primary-main"
              : "text-xl text-gray-500 hover:text-gray-700"
          }`}
          onClick={() => setActiveTab("activity")}
        >
          {activeDelegationsCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-primary-main text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {activeDelegationsCount}
            </span>
          )}
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
