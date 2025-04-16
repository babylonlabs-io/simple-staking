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
    <div className="bg-surface border-b border-secondary-strokeLight">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <span className="text-accent-secondary text-sm">
            {t.selectCrypto}
          </span>
          <div className="flex items-center gap-4">
            {cryptos.map((crypto) => (
              <div
                key={crypto.id}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${
                  crypto.enabled
                    ? "bg-primary-main/10 border border-primary-main"
                    : "opacity-50 cursor-not-allowed"
                }`}
              >
                <Image
                  src={crypto.icon}
                  alt={crypto.name}
                  width={20}
                  height={20}
                  className="rounded-full"
                />
                <span className="text-sm font-medium">
                  {t[crypto.name as keyof typeof t]}
                </span>
                {!crypto.enabled && (
                  <span className="text-xs text-accent-secondary">
                    {t.comingSoon}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
