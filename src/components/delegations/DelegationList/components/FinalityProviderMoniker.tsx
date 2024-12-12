import { useFinalityProviderState } from "@/app/state/FinalityProviderState";

interface FinalityProviderMoniker {
  value: string;
}

export function FinalityProviderMoniker({ value }: FinalityProviderMoniker) {
  const { getFinalityProviderMoniker } = useFinalityProviderState();

  const moniker = getFinalityProviderMoniker(value);

  return (
    <div className="order-4 lg:order-2 text-right lg:text-left">{moniker}</div>
  );
}
