import type { HTMLAttributes } from "react";

import { cx } from "../../utils/cx";

export interface EllipsisTextBoxProps extends HTMLAttributes<HTMLDivElement> {}

export const EllipsisTextBox = ({
  children,
  className,
}: EllipsisTextBoxProps) => {
  return (
    <div
      className={cx(
        " overflow-hidden text-ellipsis whitespace-nowrap",
        className,
      )}
    >
      {children}
    </div>
  );
};
