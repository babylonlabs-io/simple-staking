import React from "react";

import { useLanguage } from "@/app/contexts/LanguageContext";
import { translations } from "@/app/translations";

export const XRPPersonalBalance: React.FC = () => {
  const { language } = useLanguage();
  const t = translations[language];

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-lg font-semibold mb-4">{t.stakedBalance}</h2>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-gray-600">{t.stakableBalance}</span>
          <span className="font-medium">0 XRP</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-600">{t.stakedBalance}</span>
          <span className="font-medium">0 XRP</span>
        </div>
      </div>
    </div>
  );
};
