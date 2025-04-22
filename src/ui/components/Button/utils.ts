import { cva } from "class-variance-authority";

export const buttonVariants = cva(
  "group/button inline-flex items-center justify-center font-semibold whitespace-nowrap rounded-0 transition-[color,background,box-shadow] focus-visible:outline-brandDefault focus-visible:-outline-offset-1 focus-visible:outline-1 disabled:pointer-events-none outline-none",
  {
    variants: {
      variant: {
        primary: "uppercase tracking-[1px]",
        outline: "uppercase ring-inset tracking-[1px]",
        text: "uppercase underline-offset-4 hover:underline",
        menuItem:
          "normal-case !no-underline flex-start justify-start text-start w-full bg-transparent hover:bg-backgroundPrimaryHighlight hover:text-backgroundPrimaryOnHighlight [&_span]:!m-0 text-callout flounder:text-callout",
      },
      color: {
        brand: "",
        primary: "",
        secondary: "",
        inverse: "",
        inverseAccent: "",
        transparent: "",
      },
      size: {
        xs: "py-0.5 px-2 text-[clamp(10.8px,1rem+0.238095vmin,12px)] gap-1 font-mono tracking-normal leading-none",
        sm: "py-1 flounder:py-1.5 px-2.5 flounder:px-3 text-desktopCallout gap-2 font-mono tracking-normal",
        md: "py-2.5 px-4 text-mobileBody3 flounder:text-desktopBody3 gap-2 font-mono",
        lg: "py-2 px-[16px] flounder:px-6 flounder:py-3 text-mobileBody2 flounder:text-desktopBody2 gap-1 flounder:gap-2 font-mono",
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
      { variant: "outline", size: "xs", class: "ring-1" },
      { variant: "outline", size: "sm", class: "ring-1" },
      { variant: "outline", size: "md", class: "ring-2" },
      { variant: "outline", size: "lg", class: "ring-2" },
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
        variant: "primary",
        color: "primary",
        class:
          "text-backgroundInverseOnDefault bg-backgroundInverseDefault hover:text-backgroundInverseOnActive hover:bg-backgroundInverseActive focus-visible:bg-backgroundInverseActive",
      },
      {
        variant: "primary",
        color: "secondary",
        class:
          "text-backgroundSecondaryOnDefault bg-backgroundSecondaryDefault hover:text-backgroundSecondaryOnActive hover:bg-backgroundPrimaryHighlight/90 focus-visible:bg-backgroundSecondaryActive",
      },
      {
        variant: "primary",
        color: "brand",
        class:
          "text-backgroundBrandOnDefault bg-backgroundBrandDefault hover:text-backgroundBrandOnActive hover:bg-backgroundBrandActive focus-visible:bg-backgroundBrandActive",
      },
      {
        variant: "primary",
        color: "inverse",
        class:
          "text-neutral100 bg-mainPairedDefault hover:text-neutral100 hover:bg-mainPairedActive",
      },
      {
        variant: "primary",
        color: "inverseAccent",
        class:
          "text-neutral100 bg-mainPairedDefault hover:text-neutral100 hover:bg-mainPairedActive dark:bg-backgroundBrandDefault dark:text-neutral0",
      },
      {
        variant: "primary",
        disabled: true,
        class:
          "text-backgroundInverseOnMute dark:text-backgroundInverseOnMute bg-backgroundInverseMute dark:bg-backgroundInverseMute hover:text-backgroundInverseOnMute hover:bg-backgroundInverseMute group-[.bg-primary60]:bg-itemPrimaryDefaultAlt2 group-[.bg-primary60]:text-primary60 dark:group-[.bg-primary60]:text-backgroundInverseOnMute dark:group-[.bg-primary60]:bg-backgroundInverseMute",
      },
      {
        variant: "outline",
        color: "primary",
        class:
          "ring-itemPrimaryDefault text-itemPrimaryDefault bg-transparent hover:ring-itemPrimaryDefault hover:bg-itemPrimaryDefault hover:text-itemInverseDefault",
      },
      {
        variant: "outline",
        color: "secondary",
        class:
          "ring-itemPrimaryDefaultAlt2 hover:ring-itemSecondaryDefault  dark:hover:ring-itemSecondaryDefault data-[state=open]:ring-itemSecondaryDefault dark:ring-itemPrimaryMute disabled:text-backgroundPrimaryOnMute disabled:bg-transparent",
      },
      {
        variant: "outline",
        color: "secondary",
        size: "xs",
        class:
          "bg-backgroundSecondaryDefault ring-itemPrimaryDefaultAlt2 hover:ring-itemPrimaryDefault data-[state=open]:ring-itemSecondaryDefault",
      },
      {
        variant: "outline",
        disabled: true,
        class:
          "cursor-default ring-itemPrimaryMute text-itemPrimaryMute bg-itemInverseDefault hover:ring-itemPrimaryMute hover:bg-itemInverseDefault hover:text-itemPrimaryMute",
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
      {
        application: true,
        size: "sm",
        className:
          "py-1.5 px-[12px] flounder:py-1.5 flounder:px-[14px]  text-callout flounder:text-callout",
      },
      {
        application: true,
        size: "md",
        className:
          "py-[11px] px-4 flounder:px-7 flounder:py-3 text-body4 flounder:text-body4 tracking-normal",
      },
      {
        application: true,
        size: "lg",
        className:
          "py-3 px-5 flounder:px-8 flounder:py-4 text-body4 flounder:text-body4 font-semibold tracking-normal",
      },
    ],
  },
);
