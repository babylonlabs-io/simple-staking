import type { HTMLAttributes } from "react";

import useSafeMediaQuery from "../../hooks/useSafeMediaQuery";
import { breakpoints, cx } from "../../utils";

export interface PromptBoxProps extends HTMLAttributes<HTMLDivElement> {
  wrapperClassName?: string;
}

export const PromptBox = ({
  children,
  className,
  wrapperClassName,
  ...props
}: PromptBoxProps) => {
  const isSm = useSafeMediaQuery(`(max-width: ${breakpoints.tuna - 1}px)`);

  return (
    <div
      className={cx("flex items-center h-full m-auto", wrapperClassName)}
      {...props}
    >
      <div className="container p-4 mx-auto flounder:px-10">
        <div
          className={cx(
            isSm ? "max-w-[640px]" : "max-w-[560px]",
            "text-center m-auto",
            className,
          )}
        >
          {children}
        </div>
      </div>
    </div>
  );
};
