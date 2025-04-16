"use client";

import { useState } from "react";

import { GoogleLoginRequired } from "@/app/components/Auth/GoogleLoginRequired";
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

  if (!user) {
    return <GoogleLoginRequired />;
  }

  return (
    <div className="flex-1 min-w-0">
      <div className="flex border-b border-gray-200">
        <button
          className={`px-4 py-2 text-sm font-medium ${
            activeTab === "staking"
              ? "text-accent-primary border-b-2 border-primary-main"
              : "text-gray-500 hover:text-gray-700"
          }`}
          onClick={() => setActiveTab("staking")}
        >
          {t.stake}
        </button>
        <button
          className={`px-4 py-2 text-sm font-medium relative ${
            activeTab === "activity"
              ? "text-accent-primaryborder-b-2 border-primary-main"
              : "text-gray-500 hover:text-gray-700"
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
