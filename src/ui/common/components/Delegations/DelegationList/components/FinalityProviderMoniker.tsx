import { Hint } from "@/ui/common/components/Common/Hint";
import { DOCUMENTATION_LINKS } from "@/ui/common/constants";
import {
  FinalityProvider,
  FinalityProviderState,
} from "@/ui/common/types/finalityProviders";

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
        <a
          className="text-secondary-main"
          target="_blank"
          href={DOCUMENTATION_LINKS.TECHNICAL_PRELIMINARIES}
        >
          Learn more
        </a>
      </span>
    ),
  },
  [FinalityProviderState.SLASHED]: {
    tooltip: (
      <span>
        This finality provider has been slashed.{" "}
        <a
          className="text-secondary-main"
          target="_blank"
          href={DOCUMENTATION_LINKS.TECHNICAL_PRELIMINARIES}
        >
          Learn more
        </a>
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
