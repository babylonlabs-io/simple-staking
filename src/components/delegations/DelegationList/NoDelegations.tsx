import { Heading } from "@babylonlabs-io/core-ui";

import { useLanguage } from "@/app/contexts/LanguageContext";
import { translations } from "@/app/translations";
import { getNetworkConfigBBN } from "@/config/network/bbn";

const { networkFullName: bbnNetworkFullName } = getNetworkConfigBBN();

export const NoDelegations = () => {
  const { language } = useLanguage();
  const t = translations[language].noDelegations;

  return (
    <div className="flex flex-col pb-16 pt-10 text-accent-primary gap-4 text-center items-center justify-center">
      {/* <div className="bg-primary-contrast h-20 w-20 flex items-center justify-center">
        <IoEye className="text-5xl text-primary-light" />
      </div> */}
      <Heading variant="h4">
        {t.title.replace("{networkName}", bbnNetworkFullName)}
      </Heading>
      <p className="text-base">{t.description}</p>
    </div>
  );
};
