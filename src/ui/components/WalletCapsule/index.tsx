import { ReactNode } from "react";

import { cx } from "../../utils/cx";
import { Button } from "../Button";
import type { ButtonProps } from "../Button/types";
import { Icon } from "../Icon";
import { LoadingIcon } from "../LoadingIcon";

export type WalletCapsuleProps = {
  state: "disconnected" | "connected" | "warning";
  balance?: string;
  address?: string;
  connectCopy?: string;
  processingTxCopy?: string;
  customContent?: ReactNode;
} & ButtonProps;

export const WalletCapsule = ({
  state,
  balance,
  address,
  connectCopy = "Connect wallet",
  processingTxCopy = undefined,
  customContent,
  ...buttonProps
}: WalletCapsuleProps) => {
  const isWarningState = state === "warning";
  const isDefaultState = !(
    address &&
    (state === "connected" || isWarningState)
  );
  const { className: buttonClassName, ...rest } = buttonProps;
  return (
    <Button
      application
      color="secondary"
      variant="outline"
      startIcon={isDefaultState ? { iconKey: "connect", size: 12 } : undefined}
      size="sm"
      className={cx(
        isWarningState && "ring-backgroundWarningActive",
        buttonClassName,
      )}
      {...rest}
    >
      {isDefaultState ? (
        connectCopy
      ) : (
        <div className="flex gap-2 -mx-1">
          <div className="flex items-center justify-center gap-2">
            {balance && (
              <span className="uppercase text-desktopCallout text-itemPrimaryDefault">
                {balance}
              </span>
            )}

            {customContent}

            {processingTxCopy ? (
              <div className="flex items-center gap-1">
                <span className="text-desktopCallout text-itemPrimaryDefault">
                  {processingTxCopy}
                </span>
                <LoadingIcon size="goldfish" />
              </div>
            ) : (
              <span
                className={cx(
                  "text-desktopCallout normal-case",
                  isWarningState
                    ? "text-backgroundWarningOnDefault"
                    : "text-itemSecondaryDefault",
                )}
              >
                {address}
              </span>
            )}
          </div>

          {!processingTxCopy && (
            <div
              className={cx(
                "flex items-center justify-center -mr-1 bg-backgroundSecondaryDefault min-h-5",
                isWarningState && "bg-backgroundWarningDefault",
              )}
            >
              <Icon
                size={14}
                iconKey="dots"
                className={cx(
                  "mx-1",
                  isWarningState && "text-backgroundWarningOnDefault",
                )}
              />
            </div>
          )}
        </div>
      )}
    </Button>
  );
};
