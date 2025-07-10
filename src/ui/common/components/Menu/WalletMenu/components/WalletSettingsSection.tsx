import { Text } from "@babylonlabs-io/core-ui";

import { Hash } from "@/ui/common/components/Hash/Hash";
import {
  BitcoinPublicKeyIcon,
  CopyIcon,
  LinkWalletIcon,
  UsingInscriptionIcon,
} from "@/ui/common/components/Icons";

import { NewToggle } from "./Toggle";

interface WalletSettingsProps {
  ordinalsExcluded: boolean;
  linkedDelegationsVisibility: boolean;
  onIncludeOrdinals: () => void;
  onExcludeOrdinals: () => void;
  onDisplayLinkedDelegations: (value: boolean) => void;
  publicKeyNoCoord: string;
}

export const WalletSettingsSection = ({
  ordinalsExcluded,
  linkedDelegationsVisibility,
  onIncludeOrdinals,
  onExcludeOrdinals,
  onDisplayLinkedDelegations,
  publicKeyNoCoord,
}: WalletSettingsProps) => {
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="flex flex-col gap-8 w-full">
      {/* Using Inscriptions Toggle */}
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center gap-3">
          <UsingInscriptionIcon />
          <div className="flex flex-col">
            <Text
              variant="body1"
              className="text-accent-primary font-medium text-sm"
            >
              Using Inscriptions
            </Text>
            <Text variant="body2" className="text-accent-secondary text-xs">
              {ordinalsExcluded ? "Off" : "On"}
            </Text>
          </div>
        </div>
        <NewToggle
          value={!ordinalsExcluded}
          onChange={(value) =>
            value ? onIncludeOrdinals() : onExcludeOrdinals()
          }
        />
      </div>

      {/* Linked Wallet Stakes Toggle */}
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center gap-3">
          <LinkWalletIcon />
          <div className="flex flex-col">
            <Text
              variant="body1"
              className="text-accent-primary font-medium text-sm"
            >
              Linked Wallet Stakes
            </Text>
            <Text variant="body2" className="text-accent-secondary text-xs">
              {linkedDelegationsVisibility ? "On" : "Off"}
            </Text>
          </div>
        </div>
        <NewToggle
          value={linkedDelegationsVisibility}
          onChange={onDisplayLinkedDelegations}
        />
      </div>

      {/* Bitcoin Public Key */}
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <BitcoinPublicKeyIcon />
          <div className="flex flex-col flex-1 min-w-0">
            <Text
              variant="body1"
              className="text-accent-primary font-medium text-sm"
            >
              Bitcoin Public Key
            </Text>
            <Hash
              className="text-accent-secondary text-xs"
              value={publicKeyNoCoord}
              address
              noFade
              symbols={12}
              noCopy
            />
          </div>
        </div>
        <button
          onClick={() => copyToClipboard(publicKeyNoCoord)}
          className="flex-shrink-0 ml-3 p-1 rounded hover:bg-surface-tertiary transition-colors h-6 w-6 flex items-center justify-center hover:opacity-80"
        >
          <CopyIcon size={16} />
        </button>
      </div>
    </div>
  );
};
