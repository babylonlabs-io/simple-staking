import type { HTMLAttributes } from "react";
import { useState } from "react";

import { cx } from "../../utils";
import { NA_TEXT } from "../../utils/constants";
import { Button } from "../Button";
import type { ButtonProps } from "../Button/types";
import type { IconProps } from "../Icon";
import type { PopoverContentProps } from "../Popover";
import * as Popover from "../Popover";

export interface ErrorTooltipProps extends HTMLAttributes<HTMLDivElement> {
  title?: string;
  text?: string;
  hint?: string | boolean;
  iconSize?: IconProps["size"];
  popoverProps?: PopoverContentProps;
  wrapperClassName?: string;
  buttonProps?: ButtonProps;
}

export const ErrorTooltip = ({
  text,
  title,
  children,
  iconSize = 14,
  hint = NA_TEXT,
  popoverProps,
  buttonProps,
  className,
  wrapperClassName,
}: ErrorTooltipProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <span className={cx("flex items-center gap-1", wrapperClassName)}>
      {hint && <span>{hint}</span>}
      <Popover.Root open={isOpen} onOpenChange={(open) => setIsOpen(!open)}>
        <Popover.Trigger className="flex">
          <Button
            color="transparent"
            icon={{ iconKey: "alertFilled", size: iconSize }}
            className="text-itemErrorDefault !p-0"
            onMouseEnter={() => setIsOpen(true)}
            onMouseLeave={() => setIsOpen(false)}
          />
        </Popover.Trigger>
        <Popover.Content
          sideOffset={0}
          side="bottom"
          align="start"
          onMouseEnter={() => setIsOpen(true)}
          onMouseLeave={() => setIsOpen(false)}
          hideCloseButton
          alignOffset={0}
          hideArrow={false}
          className={cx(
            "max-w-[214px] bg-backgroundErrorDefault text-backgroundErrorOnDefault !text-callout border-none px-4 py-2.5 !shadow-none",
            className,
          )}
          arrowClassName="text-backgroundErrorDefault"
          {...popoverProps}
        >
          {children ?? (
            <div className="w-full py-1">
              {title && (
                <h4 className="font-semibold text-mobileCallout text-balance">
                  {title}
                </h4>
              )}
              {text && (
                <p className="text-mobileCallout text-balance">{text}</p>
              )}
              {buttonProps && (
                <Button
                  variant="text"
                  size="sm"
                  application
                  className="underline underline-offset-1 p-0 !mt-1.5"
                  {...buttonProps}
                />
              )}
            </div>
          )}
        </Popover.Content>
      </Popover.Root>
    </span>
  );
};
