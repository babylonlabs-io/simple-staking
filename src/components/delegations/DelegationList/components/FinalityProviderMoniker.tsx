import Link from "next/link";

import { useFinalityProviderState } from "@/app/state/FinalityProviderState";
import { FinalityProviderState } from "@/app/types/finalityProviders";
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
        This finality provider has been jailed. {/* TODO: add link */}
        <Link className="text-secondary-main" target="_blank" href="">
          Learn more
        </Link>
      </span>
    ),
    status: "error",
  },
  [FinalityProviderState.SLASHED]: {
    tooltip: (
      <span>
        This finality provider has been slashed. {/* TODO: add link */}
        <Link className="text-secondary-main" target="_blank" href="">
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
  const { getFinalityProvider } = useFinalityProviderState();

  const finalProvider = getFinalityProvider(value);
  const moniker = finalProvider?.description?.moniker ?? "-";
  const state = finalProvider?.state ?? FinalityProviderState.ACTIVE;
  const { tooltip = "unknown", status } =
    STATUSES[state as FinalityProviderState] ?? {};

  return (
    <Hint tooltip={tooltip} status={status}>
      {moniker}
    </Hint>
  );
}
