import Link from "next/link";

import { DOCUMENTATION_LINKS } from "@/app/constants";
import { useFinalityProviderV2State } from "@/app/state/FinalityProviderV2State";
import { FinalityProviderState } from "@/app/types/finalityProvidersV2";
import { Hint } from "@/components/common/Hint";

interface FinalityProviderMonikerProps {
  value: string;
}

const STATUSES: Record<
  FinalityProviderState,
  {
    tooltip?: React.ReactNode;
    status?: "warning" | "error";
  }
> = {
  [FinalityProviderState.ACTIVE]: {},
  [FinalityProviderState.INACTIVE]: {},
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
    status: "error",
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
  value,
}: FinalityProviderMonikerProps) {
  const { getFinalityProvider } = useFinalityProviderV2State();

  const finalProvider = getFinalityProvider(value);
  const moniker = finalProvider?.description?.moniker ?? "-";
  const state = finalProvider?.state ?? FinalityProviderState.ACTIVE;
  const { tooltip, status } = STATUSES[state as FinalityProviderState] ?? {};

  return (
    <Hint tooltip={tooltip} status={status}>
      {moniker}
    </Hint>
  );
}
