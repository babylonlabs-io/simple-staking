import { FinalityProvider } from "@/ui/common/types/finalityProviders";

export interface ChainButtonProps {
  disabled?: boolean;
  provider?: FinalityProvider;
  bsnId?: string;
  bsnName?: string;
  logoUrl?: string;
  title?: string | JSX.Element;
  onSelectFp?: () => void;
  onRemove?: (bsnId: string) => void;
  isExisting?: boolean;
}
