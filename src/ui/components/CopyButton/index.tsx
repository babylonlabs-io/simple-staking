import type { ReactNode } from "react";
import { useCallback } from "react";
import type { UseClipboardOptions } from "use-clipboard-copy";
import { useClipboard } from "use-clipboard-copy";

import { cx } from "../../utils";
import { Button } from "../Button";
import type { ButtonProps } from "../Button/types";

interface ClipboardProps {
  textToCopy: string | number;
  clipboardOptions?: UseClipboardOptions;
}

export interface InjectedCopyChildProps extends ClipboardProps {
  isCopied: boolean;
  handleCopyClick: () => void;
}

export interface HigherOrderCopyButtonProps extends ClipboardProps {
  children: (props: InjectedCopyChildProps) => ReactNode;
}

export const HigherOrderCopyButton = ({
  textToCopy,
  clipboardOptions,
  children,
}: HigherOrderCopyButtonProps) => {
  const clipboard = useClipboard({
    copiedTimeout: 2000,
    ...clipboardOptions,
  });

  const handleCopyClick = useCallback(() => {
    clipboard.copy(textToCopy);
  }, [textToCopy, clipboard]);

  return children({
    textToCopy,
    handleCopyClick,
    isCopied: clipboard.copied,
  });
};

export interface IconCopyButtonProps extends ClipboardProps {
  iconButtonProps?: Partial<ButtonProps>;
  onClick?: ButtonProps["onClick"];
}

export const IconCopyButton = ({
  textToCopy,
  clipboardOptions,
  iconButtonProps,
  onClick,
}: IconCopyButtonProps) => {
  return (
    <HigherOrderCopyButton
      textToCopy={textToCopy}
      clipboardOptions={clipboardOptions}
    >
      {({ handleCopyClick, isCopied }) => (
        <Button
          variant="text"
          {...iconButtonProps}
          icon={{
            iconKey: isCopied ? "check" : "copy",
            size: iconButtonProps?.icon?.size ?? 16,
            className: cx("size-4", iconButtonProps?.icon?.className),
          }}
          onClick={(event: React.MouseEvent<HTMLButtonElement>) => {
            handleCopyClick();
            onClick && onClick(event);
          }}
        />
      )}
    </HigherOrderCopyButton>
  );
};
