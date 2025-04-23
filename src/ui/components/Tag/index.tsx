import type { HTMLAttributes, ReactNode } from "react";

import { cx } from "../../utils/cx";
import { Icon } from "../Icon";
import type { IconKeyVariant } from "../Icon/types";

export interface TagProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  className?: string;
  iconKey?: IconKeyVariant;
  title?: string | ReactNode;
}

export const Tag = ({
  className,
  iconKey,
  title,
  children,
  ...props
}: TagProps) => {
  const classNames = cx(
    "inline-flex bg-brandDefault text-neutral0 gap-1.5 flounder:gap-1 p-1.5 flounder:p-2 items-center",
    className,
  );

  return (
    <div className={classNames} {...props}>
      {iconKey && (
        <Icon iconKey={iconKey} className="!size-3 flounder:!size-4" />
      )}
      {children || <span className="text-tag1">{title}</span>}
    </div>
  );
};
