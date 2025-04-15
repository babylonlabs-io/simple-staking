"use client";

import { useWalletConnect } from "@babylonlabs-io/wallet-connector";

import { Container } from "@/app/components/Container/Container";
import { useLanguage } from "@/app/contexts/LanguageContext";
import { useAppState } from "@/app/state";
import { translations } from "@/app/translations";

import { GoogleLoginButton } from "../GoogleLoginButton";
import { SmallLogo } from "../Logo/SmallLogo";
import { Connect } from "../Wallet/Connect";

export const Header = () => {
  const { open } = useWalletConnect();
  const { isLoading: loading } = useAppState();
  const { language, setLanguage } = useLanguage();
  const t = translations[language];

  return (
    <header className="bg-primary-main h-[12.75rem]">
      <Container className="h-20 flex items-center justify-between">
        <SmallLogo />

        <div className="flex items-center gap-4">
          <GoogleLoginButton />
          <Connect loading={loading} onConnect={open} />
          <div className="flex items-center gap-2">
            <button
              className={`text-sm font-medium ${language === "en" ? "text-accent-secondary" : "text-accent-secondary/50"}`}
              onClick={() => setLanguage("en")}
            >
              EN
            </button>
            <span className="text-accent-secondary text-sm font-medium">|</span>
            <button
              className={`text-sm font-medium ${language === "ko" ? "text-accent-secondary" : "text-accent-secondary/50"}`}
              onClick={() => setLanguage("ko")}
            >
              KO
            </button>
          </div>
        </div>
      </Container>
    </header>
  );
};
