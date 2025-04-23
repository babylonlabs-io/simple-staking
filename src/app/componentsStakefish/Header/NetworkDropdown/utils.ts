import { IconKeyVariant } from "@/ui";
import { WEBSITE_URL } from "@/utils/stakefish";

export const ProtocolVariants = ["ethereum", "babylon"] as const;
export const ChainIdVariants = [1, 560048] as const;
export const ExtendedNetworks = ["Babylon"];

export type ProtocolVariant = (typeof ProtocolVariants)[number];
export type ChainIdVariant = (typeof ChainIdVariants)[number];
export type ChainType = (typeof ChainIdVariants)[number] | ExtendedNetworksType;
export type ExtendedNetworksType = (typeof ExtendedNetworks)[number];
export type DashboardNavs = Record<ProtocolVariant, DashboardNavItem>;
export type DashboardNavItem = {
  displayName: ExtendedNetworksType | "Ethereum";
  logo: IconKeyVariant;
  link: string;
};

export const dashboardNavs: DashboardNavs = {
  ethereum: {
    displayName: "Ethereum",
    logo: "ethLogo",
    link: `${WEBSITE_URL}/dashboard`,
  },
  babylon: {
    displayName: "Babylon",
    logo: "babylonLogo",
    link: `/`,
  },
};
