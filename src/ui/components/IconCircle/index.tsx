"use client";

import { cx } from "../../utils/cx";
import { Icon, type IconProps } from "../Icon";

export interface IconCircleProps extends IconProps {
  className?: string;
  iconClassName?: string;
  bordered?: boolean;
}

export const IconCircle = ({
  className,
  iconKey,
  bordered,
  size = 40,
  iconClassName,
  ...props
}: IconCircleProps) => {
  const classNames = cx(
    "inline-flex items-center justify-center size-15 flounder:size-16 rounded-full p-4 flounder:p-5",
    bordered && "ring-1 ring-itemPrimaryDefaultAlt2 ring-inset",
    className,
  );

  return (
    <div className={classNames}>
      {iconKey && (
        <Icon
          iconKey={iconKey}
          size={size}
          className={cx("size-full", iconClassName)}
          {...props}
        />
      )}
    </div>
  );
};
