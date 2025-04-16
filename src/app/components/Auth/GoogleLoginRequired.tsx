"use client";

import { useLanguage } from "@/app/contexts/LanguageContext";
import { translations } from "@/app/translations";

import { GoogleLoginButton } from "../GoogleLoginButton";

export const GoogleLoginRequired = () => {
  const { language } = useLanguage();
  const t = translations[language];

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-6 text-center w-full">
      {/* <div className="flex-1"> */}
      <h2 className="text-2xl font-bold mb-4">{t.googleLoginRequired}</h2>
      <p className="text-gray-600 mb-8">{t.googleLoginRequiredDescription}</p>
      <GoogleLoginButton />
      {/* </div> */}
    </div>
  );
};
