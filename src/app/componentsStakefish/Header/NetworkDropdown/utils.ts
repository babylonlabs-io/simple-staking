import { IconKeyVariant } from "@/ui";
import { WEBSITE_URL } from "@/utils/stakefish";

export const ProtocolVariants = [
  "ethereum",
  "babylon",
  "babylon-genesis",
] as const;
export const ChainIdVariants = [1, 560048] as const;

export type ProtocolVariant = (typeof ProtocolVariants)[number];
export type ChainIdVariant = (typeof ChainIdVariants)[number];
export type ChainType = (typeof ChainIdVariants)[number] | ExtendedNetworksType;
export type TabNameType = keyof typeof mappedNames;
export type ExtendedNetworksType = (typeof ExtendedNetworks)[number];
export type DashboardNavs = Record<ProtocolVariant, DashboardNavItem>;
export type DashboardNavItem = {
  displayName: ExtendedNetworksType | "Ethereum";
  logo: IconKeyVariant;
  link: string;
};

export const ExtendedNetworks = ["Babylon"];

export const dashboardNavs: DashboardNavs = {
  ethereum: {
    displayName: "Ethereum",
    logo: "ethLogo",
    link: `${WEBSITE_URL}/dashboard`,
  },
  "babylon-genesis": {
    displayName: "Babylon Genesis",
    logo: "babylonLogo",
    link: `/`,
  },
  babylon: {
    displayName: "Babylon",
    logo: "babylonLogo",
    link: `${WEBSITE_URL}/babylon/dashboard`,
  },
};

export const mappedNames = {
  Mainnet: "Ethereum",
  Hoodi: "Hoodi",
  Babylon: "Babylon",
} as const;
