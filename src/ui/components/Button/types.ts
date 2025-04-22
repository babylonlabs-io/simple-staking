import type { VariantProps } from "class-variance-authority";
import type {
  ButtonHTMLAttributes,
  ElementType,
  ForwardedRef,
  ReactNode,
} from "react";

import type { IconProps } from "../Icon";

import type { buttonVariants } from "./utils";

export const ButtonSizeVariants = ["xs", "sm", "md", "lg"] as const;
export type ButtonSizeVariant = (typeof ButtonSizeVariants)[number];

export interface ButtonProps
  extends Omit<
      ButtonHTMLAttributes<HTMLButtonElement>,
      "color" | "disabled" | "size"
    >,
    Omit<VariantProps<typeof buttonVariants>, "icon"> {
  asChild?: boolean;
  Element?: ElementType;
  as?: ElementType;
  href?: string;
  endIcon?: IconProps;
  icon?: IconProps;
  startIcon?: IconProps;
  size?: ButtonSizeVariant;
  download?: boolean | string;
  children?: ReactNode | ReactNode[];
  ref?: ForwardedRef<HTMLButtonElement | HTMLAnchorElement>;
}

export interface ButtonStoryProps extends ButtonProps {
  startIconKey?: IconProps["iconKey"];
  startIconSize?: IconProps["size"];
  endIconKey?: IconProps["iconKey"];
  endIconSize?: IconProps["size"];
  iconKey?: IconProps["iconKey"];
  iconSize?: IconProps["size"];
}
