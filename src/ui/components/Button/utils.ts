import { cva } from "class-variance-authority";

export const buttonVariants = cva("btn group/button", {
  variants: {
    variant: {
      primary: "btn-primary",
      outline: "btn-outline",
      text: "btn-text",
      menuItem: "btn-menuItem",
    },
    color: {
      brand: "btn-color-brand",
      primary: "btn-color-primary",
      secondary: "btn-color-secondary",
      inverse: "btn-color-inverse",
      inverseAccent: "btn-color-inverseAccent",
      transparent: "btn-color-transparent",
    },
    size: {
      xs: "btn-xs",
      sm: "btn-sm",
      md: "btn-md",
      lg: "btn-lg",
    },
    icon: {
      true: undefined,
      false: undefined,
    },
    disabled: {
      true: "pointer-events-none",
      false: undefined,
    },
    application: {
      true: undefined,
      false: undefined,
    },
  },
  compoundVariants: [
    {
      icon: false,
      variant: "text",
      size: "sm",
      class: "-my-1.5 -mx-2.5 flounder:-mx-3 flounder:-my-1.5",
    },
    { icon: false, variant: "text", size: "md", class: "-my-2.5 -mx-4" },
    {
      icon: false,
      variant: "text",
      size: "lg",
      class: "-my-3 -mx-4 flounder:-mx-6 flounder:-my-3",
    },
    { icon: true, size: "xs", class: "p-[6px] flounder:p-[7px]" },
    { icon: true, size: "sm", class: "p-[6px] flounder:p-[7px]" },
    { icon: true, size: "md", class: "p-[8px] flounder:p-[9px]" },
    { icon: true, size: "lg", class: "p-2.5 flounder:p-2.5" },
    {
      icon: true,
      variant: "text",
      size: "xs",
      class: "p-[6px] flounder:p-[7px] m-[-6px] flounder:m-[-7px]",
    },
    {
      icon: true,
      variant: "text",
      size: "sm",
      class: "p-[6px] flounder:p-[7px] m-[-6px] flounder:m-[-7px]",
    },
    {
      icon: true,
      variant: "text",
      size: "md",
      class: "p-[8px] flounder:p-[9px] m-[-8px] flounder:m-[-9px]",
    },
    {
      icon: true,
      variant: "text",
      size: "lg",
      class: "p-2.5 flounder:p-2.5 -m-2.5 flounder:-m-2.5",
    },
    {
      variant: "menuItem",
      size: "sm",
      class: "py-[6px] px-[14px] flounder:py-[6px] flounder:px-[14px]",
    },
    {
      variant: "menuItem",
      color: "primary",
      class:
        "bg-transparent hover:bg-backgroundPrimaryHighlight hover:text-backgroundPrimaryOnHighlight",
    },
    {
      variant: "menuItem",
      color: "transparent",
      class: "!bg-transparent hover:!transparent",
    },
    {
      variant: "menuItem",
      disabled: true,
      class:
        "cursor-default text-itemPrimaryDefault/60 hover:text-itemPrimaryDefault/60",
    },
    {
      variant: "text",
      color: "primary",
      class:
        "disabled:text-backgroundPrimaryOnMute data-[disabled]:!text-backgroundPrimaryOnMute",
    },
    {
      variant: "text",
      color: "secondary",
      class:
        "text-itemSecondaryDefault hover:text-itemPrimaryDefault disabled:text-backgroundPrimaryOnMute data-[disabled]:!text-backgroundPrimaryOnMute",
    },
    {
      variant: "text",
      application: true,
      class: "underline-offset-1",
    },
  ],
});
