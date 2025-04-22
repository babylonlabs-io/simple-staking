import type { VariantProps } from "class-variance-authority";
import { cva } from "class-variance-authority";
import type { ReactNode } from "react";

import { cx } from "../../utils/cx";
import { Icon } from "../Icon";

export interface LoadingIconProps extends VariantProps<typeof iconVariants> {
  customIcon?: ReactNode;
  className?: string;
}

const iconVariants = cva("flex items-center justify-center [&>img]:size-full", {
  variants: {
    size: {
      goldfish: "size-3",
      tilapia: "size-5",
      cod: "size-6",
      trout: "size-7",
      salmon: "size-8",
      tuna: "size-10",
      whale: "size-12",
    },
  },
  defaultVariants: {
    size: "salmon",
  },
});

export const LoadingIcon = ({
  size = "salmon",
  customIcon,
  className,
  ...props
}: LoadingIconProps) => {
  if (customIcon)
    return (
      <div className={cx(iconVariants({ size }), "loading-icon", className)}>
        {customIcon}
      </div>
    );
  return (
    <Icon
      iconKey="loading"
      className={cx(iconVariants({ size }), "loading-icon", className)}
      {...props}
    />
  );
};
