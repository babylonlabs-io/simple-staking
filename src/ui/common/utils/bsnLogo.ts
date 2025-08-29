import { getRegistry } from "@babylonlabs-io/bsn-registry";

import placeholder from "@/ui/common/assets/chain-placeholder.svg";
import { network } from "@/ui/common/config/network/bbn";

const registry = getRegistry(network === "mainnet" ? "mainnet" : "testnet");

export function getBsnLogoUrl(bsnId?: string): string {
  if (!bsnId) return placeholder;
  return registry[bsnId]?.logoUrl || placeholder;
}
