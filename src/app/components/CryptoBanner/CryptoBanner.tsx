import Image from "next/image";

import { useLanguage } from "@/app/contexts/LanguageContext";
import { translations } from "@/app/translations";

const cryptos = [
  {
    id: "bitcoin",
    name: "bitcoin",
    icon: "/bitcoin.png",
    enabled: true,
  },
  {
    id: "sui",
    name: "sui",
    icon: "/sui.png",
    enabled: false,
  },
  {
    id: "ethereum",
    name: "ethereum",
    icon: "/ethereum.png",
    enabled: false,
  },
  {
    id: "xrp",
    name: "xrp",
    icon: "/xrp.png",
    enabled: false,
  },
];

export const CryptoBanner = () => {
  const { language } = useLanguage();
  const t = translations[language];

  return (
    <div className="bg-white border-b border-secondary-strokeLight">
      <div className="container mx-auto py-3">
        <div className="flex items-center justify-between">
          <span className="text-black text-sm">{t.staking}</span>
          <div className="flex items-center">
            <span className="text-black text-sm">{t.selectCrypto}</span>
            <div className="flex items-center gap-2">
              {cryptos
                .filter((crypto) => crypto.enabled)
                .map((crypto) => (
                  <div
                    key={crypto.id}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-lg ${
                      crypto.enabled ? "" : "cursor-not-allowed"
                    }`}
                  >
                    <Image
                      src={crypto.icon}
                      alt={crypto.name}
                      width={20}
                      height={20}
                      className="rounded-full"
                    />
                    <span className="text-sm text-black font-medium">
                      {t[crypto.name as keyof typeof t]}
                    </span>
                  </div>
                ))}
              {/* divider */}
              <div className="h-4 w-px bg-secondary-strokeLight" />
              {/* coming soon */}
              <span className="text-xs text-black">{t.comingSoon}</span>
              {cryptos
                .filter((crypto) => !crypto.enabled)
                .map((crypto) => (
                  <div
                    key={crypto.id}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-lg ${
                      crypto.enabled ? "" : "cursor-not-allowed"
                    }`}
                  >
                    <Image
                      src={crypto.icon}
                      alt={crypto.name}
                      width={20}
                      height={20}
                      className="rounded-full"
                    />
                    <span className="text-sm text-black font-medium">
                      {t[crypto.name as keyof typeof t]}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
