import { Text } from "@babylonlabs-io/core-ui";

import { DisplayHash } from "@/ui/common/components/Hash";
import {
  CopyIcon,
  LinkWalletIcon,
  UsingInscriptionIcon,
} from "@/ui/common/components/Icons";
import { useCopy } from "@/ui/common/hooks/useCopy";

import { Toggle } from "./Toggle";

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
  const { copyToClipboard, isCopied } = useCopy();

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
        <Toggle
          value={!ordinalsExcluded}
          onChange={(value: boolean) =>
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
        <Toggle
          value={linkedDelegationsVisibility}
          onChange={onDisplayLinkedDelegations}
        />
      </div>

      {/* Bitcoin Public Key */}
      <div className="bg-secondary-highlight dark:bg-secondary-strokeLight rounded p-4">
        <div className="flex flex-col w-full">
          <div className="flex justify-start mb-3">
            <Text
              variant="body1"
              className="text-accent-secondary font-medium text-xs"
            >
              Bitcoin Public Key
            </Text>
          </div>

          <div className="flex items-center justify-between w-full">
            {isCopied("publicKey") ? (
              <Text className="text-accent-primary text-sm flex-1 min-w-0">
                Copied ✓
              </Text>
            ) : (
              <DisplayHash
                className="text-accent-primary text-sm flex-1 min-w-0"
                value={publicKeyNoCoord}
                symbols={12}
              />
            )}
            <button
              onClick={() => copyToClipboard("publicKey", publicKeyNoCoord)}
              className="flex-shrink-0 ml-3 p-1 rounded hover:bg-surface-tertiary transition-colors h-6 w-6 flex items-center justify-center hover:opacity-80"
            >
              <CopyIcon size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
