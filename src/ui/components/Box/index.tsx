import { Slot } from "@radix-ui/react-slot";
import type { VariantProps } from "class-variance-authority";
import { cva } from "class-variance-authority";
import type { ElementType, ForwardedRef, HTMLAttributes } from "react";

import { cx } from "../../utils";

const defaultElement = "div" as const;

export const boxVariants = cva("", {
  variants: {
    textAlign: {
      left: "text-left",
      center: "text-center",
      right: "text-end",
    },
    flex: {
      true: "flex items-center",
    },
    wrap: {
      wrap: "flex-wrap",
      "no-wrap": "flex-nowrap",
      "wrap-reverse": "flex-wrap-reverse",
    },
    reverse: {
      true: "flex-row-reverse",
    },
    flow: {
      row: "flex-row",
      column: "flex-col",
      "row-reverse": "flex-row-reverse",
      "column-reverse": "flex-col-reverse",
    },
    justifyContent: {
      start: "justify-start",
      center: "justify-center",
      end: "justify-end",
      stretch: "justify-stretch",
      "space-between": "justify-between",
    },
    alignItems: {
      start: "items-start",
      center: "items-center",
      end: "items-end",
      stretch: "items-stretch",
      baseline: "baseline",
    },
  },
});

interface BaseBoxProps extends VariantProps<typeof boxVariants> {
  asChild?: boolean;
  as?: ElementType;
  ref?: ForwardedRef<HTMLDivElement>;
}

export type BoxProps = HTMLAttributes<HTMLDivElement> & BaseBoxProps;

export const Box = ({
  as,
  asChild,
  textAlign,
  flex,
  wrap,
  reverse,
  flow,
  justifyContent,
  alignItems,
  className,
  ref,
  ...rest
}: BoxProps) => {
  const Component = asChild ? Slot : as || defaultElement;

  return (
    <Component
      className={cx(
        boxVariants({
          textAlign,
          flex,
          wrap,
          reverse,
          flow,
          justifyContent,
          alignItems,
        }),
        className,
      )}
      {...rest}
      ref={ref}
    />
  );
};
Box.displayName = "Box";
