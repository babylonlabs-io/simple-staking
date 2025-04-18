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
    <div
      className="border-b border-secondary-strokeLight"
      style={{
        background:
          "radial-gradient(18.37% 384.25% at 78.88% 0%, #F2DDAC 0%, #FFFDF9 100%)" /* warning: gradient uses a rotation that is not supported by CSS and may not behave as expected */,
      }}
    >
      <div className="container mx-auto py-2">
        <div className="flex items-center justify-center">
          {/* <span className="text-black text-sm">{t.staking}</span> */}
          <div className="flex items-center">
            {/* <span className="text-black text-sm">{t.selectCrypto}</span> */}
            <div className="flex items-center gap-4">
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
                    <span className="text-sm text-black font-semibold underline">
                      {t[crypto.name as "bitcoin" | "sui" | "ethereum" | "xrp"]}
                    </span>
                  </div>
                ))}
              {/* divider */}
              {/* <div className="h-4 w-px bg-secondary-strokeLight" /> */}
              {/* coming soon */}
              {/* <span className="text-xs text-black">{t.comingSoon}</span> */}
              {cryptos
                .filter((crypto) => !crypto.enabled)
                .map((crypto) => (
                  <div
                    key={crypto.id}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-lg ${
                      crypto.enabled ? "" : "cursor-not-allowed opacity-40"
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
                      {t[crypto.name as "bitcoin" | "sui" | "ethereum" | "xrp"]}
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
