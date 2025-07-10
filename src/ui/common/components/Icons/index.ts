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
export { CopyIcon } from "./common/CopyIcon";
