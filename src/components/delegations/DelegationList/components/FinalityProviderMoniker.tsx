import { useFinalityProviderV2Service } from "@/app/hooks/services/useFinalityProviderV2Service";

interface FinalityProviderMoniker {
  value: string;
}

export function FinalityProviderMoniker({ value }: FinalityProviderMoniker) {
  const { getFinalityProviderMoniker } = useFinalityProviderV2Service();

  const moniker = getFinalityProviderMoniker(value);

  return (
    <div className="order-4 lg:order-2 text-right lg:text-left">{moniker}</div>
  );
}
