import { Button, FinalityProviderItem } from "@babylonlabs-io/core-ui";
import { twMerge } from "tailwind-merge";

import { ChainButtonProps } from "./types";

export const ChainButton = ({
  disabled,
  title,
  provider,
  bsnId,
  bsnName,
  logoUrl,
  onSelectFp,
  onRemove,
  isExisting = false,
}: ChainButtonProps) => (
  <div
    className={twMerge(
      provider
        ? "bg-secondary-highlight w-full py-[14px] px-[14px] rounded"
        : "bg-secondary-highlight w-full py-[14px] px-[14px] rounded flex items-center justify-between",
      disabled ? "opacity-50" : "",
    )}
  >
    <div className="flex items-center text-base">
      {provider ? (
        <div className="w-full">
          <FinalityProviderItem
            bsnId={bsnId || ""}
            bsnName={bsnName || ""}
            provider={provider}
            onRemove={isExisting ? undefined : () => onRemove?.(bsnId || "")}
          />
        </div>
      ) : (
        <>
          {logoUrl && (
            <img
              src={logoUrl}
              alt="chain-logo"
              className="max-w-[40px] max-h-[40px] mr-2 rounded-full"
            />
          )}
          {title}
        </>
      )}
    </div>
    {!provider && (
      <Button
        variant="outlined"
        disabled={disabled}
        onClick={onSelectFp}
        className="box-border flex items-center justify-center p-1 w-[86px] h-[28px] border border-secondary-strokeDark rounded text-accent-primary text-sm"
      >
        Select FP
      </Button>
    )}
  </div>
);
