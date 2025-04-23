import type { SkeletonProps as RawSkeletonProps } from "react-loading-skeleton";
import RawSkeleton from "react-loading-skeleton";

import { cx } from "../../utils/cx";

export interface SkeletonProps extends RawSkeletonProps {
  className?: string;
}

export const Skeleton = ({ className, ...props }: SkeletonProps) => {
  return (
    <RawSkeleton
      baseColor="hsl(var(--twc-backgroundSecondaryDefault) / 1)"
      highlightColor="hsl(var(--twc-backgroundSecondaryMute) / 1)"
      borderRadius={0}
      duration={1.25}
      className={cx("align-top h-full w-full", className)}
      {...props}
    />
  );
};
