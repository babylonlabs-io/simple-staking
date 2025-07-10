// Base icon props interface
export interface BaseIconProps {
  className?: string;
  size?: number;
}

// Extended icon props with variant support
export interface IconProps extends BaseIconProps {
  variant?: "default" | "primary" | "secondary" | "error" | "success";
}

export { ThemedIcon } from "./ThemedIcon";

// Wallet icons
export { BitcoinPublicKeyIcon } from "./wallet/BitcoinPublicKeyIcon";
export { LinkWalletIcon } from "./wallet/LinkWalletIcon";
export { UsingInscriptionIcon } from "./wallet/UsingInscriptionIcon";

// Common icons
export { ChevronLeftIcon } from "./common/ChevronLeftIcon";
export { ChevronRightIcon } from "./common/ChevronRightIcon";
export { CopyIcon } from "./common/CopyIcon";
export { CurrencyIcon } from "./common/CurrencyIcon";
export { DocumentIcon } from "./common/DocumentIcon";
export { NetworkIcon } from "./common/NetworkIcon";
export { ShieldIcon } from "./common/ShieldIcon";
export { ThemeIcon } from "./common/ThemeIcon";
export { WarningIcon } from "./common/WarningIcon";
