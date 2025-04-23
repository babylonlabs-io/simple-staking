import type { HTMLAttributes, PropsWithChildren } from "react";

import { cx } from "../../utils/cx";

export interface AnnouncementProps extends HTMLAttributes<HTMLDivElement> {
  animate?: boolean;
  wrapperClassName?: string;
}

export const Announcement = ({
  className,
  wrapperClassName,
  children,
  animate = false,
  ...rest
}: PropsWithChildren<AnnouncementProps>) => {
  return (
    <div
      className={cx(
        "overflow-hidden -translate-y-full opacity-0 motion-safe:transition-all motion-safe:delay-100 motion-safe:duration-700",
        animate && "translate-y-0 opacity-100",
        wrapperClassName,
      )}
    >
      <div
        className={cx(
          "px-4 py-2.5 flex gap-4 items-center justify-center motion-safe:transition-colors motion-safe:duration-500 motion-safe:delay-1000 bg-backgroundInverseDefault text-backgroundInverseOnDefault",
          className,
        )}
        {...rest}
      >
        {children}
      </div>
    </div>
  );
};
