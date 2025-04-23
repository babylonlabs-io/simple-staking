import { cva } from "class-variance-authority";
import type { ReactNode } from "react";

import { cx } from "../../utils/cx";
import type { IconProps } from "../Icon";
import { Icon } from "../Icon";
import type { LoadingIconProps } from "../LoadingIcon";
import { LoadingIcon } from "../LoadingIcon";

export type AlertBoxProps = {
  showIcon?: boolean;
  iconProps?: IconProps;
  loadingIconProps?: LoadingIconProps;
  text?: string;
  customizedContent?: ReactNode | ReactNode[];
  variant?: "neutral" | "error" | "inverse" | "success" | "warning";
  bordered?: boolean;
  centered?: boolean;
  isLoading?: boolean;
  className?: string;
};

export const AlertBox = ({
  showIcon = true,
  iconProps,
  loadingIconProps,
  text,
  customizedContent,
  variant = "error",
  bordered = true,
  centered = false,
  isLoading = false,
  className,
}: AlertBoxProps) => (
  <div
    className={cx(
      variants({ variant }),
      bordered ? "border" : "",
      centered ? "justify-center" : "",
      className,
    )}
  >
    {showIcon &&
      (isLoading ? (
        <LoadingIcon size="goldfish" {...loadingIconProps} />
      ) : (
        <Icon
          iconKey="alertFilled"
          size={14}
          className="mt-[2px] flounder:mt-[3px] min-w-3.5"
          {...iconProps}
        />
      ))}
    {!customizedContent && text}
    {Boolean(customizedContent) && customizedContent}
  </div>
);

const variants = cva(
  "flex gap-2 flounder:gap-3 py-3.5 px-4 items-start text-desktopCallout",
  {
    variants: {
      variant: {
        neutral:
          "text-backgroundSecondaryOnDefault bg-backgroundSecondaryDefault border-itemSecondaryMute",
        error:
          "text-backgroundErrorOnDefault bg-backgroundErrorDefault border-itemErrorMute",
        warning:
          "text-backgroundWarningOnDefault bg-backgroundWarningDefault border-itemWarningMute",
        inverse: "text-neutral90 bg-neutral0 border-transparent",
        success:
          "text-backgroundBrandOnDefault dark:text-neutral0 bg-backgroundBrandDefault border-transparent",
      },
    },
  },
);
