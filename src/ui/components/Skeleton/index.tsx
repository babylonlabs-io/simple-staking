import type { SkeletonProps as RawSkeletonProps } from "react-loading-skeleton";
import RawSkeleton from "react-loading-skeleton";

import { cx } from "../../utils/cx";

export interface SkeletonProps extends RawSkeletonProps {
  className?: string;
}

export const Skeleton = ({ className, ...props }: SkeletonProps) => {
  return (
    <RawSkeleton
      baseColor="rgb(var(--color-backgroundSecondaryDefault))"
      highlightColor="rgb(var(--color-backgroundSecondaryMute))"
      borderRadius={0}
      duration={1.25}
      className={cx("align-top h-full", className)}
      {...props}
    />
  );
};
