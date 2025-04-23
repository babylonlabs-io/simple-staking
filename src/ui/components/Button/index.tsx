import { Slot } from "@radix-ui/react-slot";
import { forwardRef } from "react";

import { cx } from "../../utils/cx";
import { Icon } from "../Icon";

import type { ButtonProps, ButtonSizeVariant } from "./types";
import { buttonVariants } from "./utils";

export const Button = forwardRef<
  HTMLButtonElement | HTMLAnchorElement,
  ButtonProps
>(
  (
    {
      children,
      size = "lg",
      color = "primary",
      variant = "primary",
      href,
      as,
      className,
      Element,
      endIcon,
      startIcon,
      asChild,
      icon,
      disabled,
      application,
      ...rest
    },
    ref,
  ) => {
    const ButtonElement = Element || as || (href ? "a" : "button");
    const linkDefaultProps = href?.includes("http")
      ? { href, rel: "noopener noreferrer", target: "_blank" }
      : { href };
    const defaultProps =
      Element === "button" ? { type: "button" } : linkDefaultProps;
    const Comp = asChild ? Slot : ButtonElement;

    const formattedStartIconProps = startIcon?.iconKey && {
      ...startIcon,
      size: startIcon.size,
      iconKey: startIcon.iconKey,
      className: cx(
        presetStartIconIndent[size as ButtonSizeVariant],
        startIcon.className,
        !startIcon.size ? presetIconSize[size as ButtonSizeVariant] : "",
      ),
    };

    const formattedEndIconProps = endIcon?.iconKey && {
      ...endIcon,
      size: endIcon.size,
      iconKey: endIcon.iconKey,
      className: cx(
        presetEndIconIndent[size as ButtonSizeVariant],
        endIcon.className,
        !endIcon.size ? presetIconSize[size as ButtonSizeVariant] : "",
      ),
    };

    const formattedOnlyIconProps = icon?.iconKey && {
      ...icon,
      size: icon.size,
      iconKey: icon.iconKey,
      className: cx(
        icon.className,
        !icon.size ? presetIconSize[size as ButtonSizeVariant] : "",
      ),
    };

    return (
      <Comp
        className={cx(
          buttonVariants({
            variant,
            size,
            color,
            icon: Boolean(formattedOnlyIconProps),
            disabled,
            application,
          }),
          className,
        )}
        ref={ref}
        disabled={disabled}
        {...defaultProps}
        {...rest}
      >
        {formattedOnlyIconProps ? (
          <Icon {...formattedOnlyIconProps} />
        ) : (
          <>
            {formattedStartIconProps && <Icon {...formattedStartIconProps} />}
            {children && <div>{children}</div>}
            {formattedEndIconProps && <Icon {...formattedEndIconProps} />}
          </>
        )}
      </Comp>
    );
  },
);
Button.displayName = "Button";

const presetIconSize: Record<ButtonSizeVariant, string> = {
  xs: "size-4 flounder:size-[18px]",
  sm: "size-4 flounder:size-[18px]",
  md: "size-5",
  lg: "size-5 flounder:size-6",
};

const presetStartIconIndent: Record<ButtonSizeVariant, string> = {
  xs: "-ml-[5px]",
  sm: "-ml-[5px]",
  md: "-ml-[5px]",
  lg: "-ml-1 flounder:-ml-2.5",
};

const presetEndIconIndent: Record<ButtonSizeVariant, string> = {
  xs: "-mr-[5px]",
  sm: "-mr-[5px]",
  md: "-mr-[5px]",
  lg: "-mr-1 -my-[3px] flounder:-mr-2.5",
};
