import Image from "next/image";
import { FC } from "react";

import BannerWarningIcon from "@/app/assets/banner-warning.svg";
import { shouldDisableUnbonding } from "@/config";
import { getNetworkConfig } from "@/config/network.config";

interface UnbondingDisabledBannerProps {}

export const UnbondingDisabledBanner: FC<UnbondingDisabledBannerProps> = () => {
  if (!shouldDisableUnbonding()) return null;
  const { network, coinName } = getNetworkConfig();

  return (
    <div className="w-full bg-[#FDF2EC] min-h-[50px] p-2 lg:min-h-[40px] flex items-center justify-center">
      <div className="flex items-center">
        <Image
          src={BannerWarningIcon}
          alt="Warning Icon"
          className="mr-2 text-sm"
        />
        <p className="text-xs md:text-sm text-black text-center flex flex-col md:block">
          <strong className="block mb-1 md:mb-0 md:inline">
            Unbonding disabled during Phase-2 {network} Transition
            <span className="hidden md:inline">:</span>
          </strong>{" "}
          <span className="block text-xs md:text-sm md:inline">
            To support a smooth transition of the {network} to Phase-2,
            on-demand unbonding has been disabled until the phase-2 {network}
            launch.
          </span>
        </p>
      </div>
    </div>
  );
};
