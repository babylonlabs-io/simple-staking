import Link from "next/link";

import { DOCUMENTATION_LINKS } from "@/app/constants";
import {
  FinalityProvider,
  FinalityProviderState,
} from "@/app/types/finalityProviders";
import { Hint } from "@/components/common/Hint";

interface FinalityProviderMonikerProps {
  value: FinalityProvider;
}

const STATUSES: Record<
  string,
  {
    tooltip?: React.ReactNode;
    status?: "warning" | "error";
  }
> = {
  [FinalityProviderState.INACTIVE]: {
    tooltip: "This finality provider is inactive.",
  },
  [FinalityProviderState.JAILED]: {
    tooltip: (
      <span>
        This finality provider has been jailed.{" "}
        <Link
          className="text-secondary-main"
          target="_blank"
          href={DOCUMENTATION_LINKS.TECHNICAL_PRELIMINARIES}
        >
          Learn more
        </Link>
      </span>
    ),
  },
  [FinalityProviderState.SLASHED]: {
    tooltip: (
      <span>
        This finality provider has been slashed.{" "}
        <Link
          className="text-secondary-main"
          target="_blank"
          href={DOCUMENTATION_LINKS.TECHNICAL_PRELIMINARIES}
        >
          Learn more
        </Link>
      </span>
    ),
    status: "error",
  },
};

export function FinalityProviderMoniker({
  value: finalProvider,
}: FinalityProviderMonikerProps) {
  const moniker = finalProvider?.description?.moniker ?? "-";
  const state = finalProvider?.state ?? FinalityProviderState.ACTIVE;
  const { tooltip, status } = STATUSES[state] ?? {};

  return (
    <Hint tooltip={tooltip} status={status}>
      {moniker}
    </Hint>
  );
}
