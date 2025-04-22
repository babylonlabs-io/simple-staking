import { cva } from "class-variance-authority";

export const cardVariants = cva("relative flex group overflow-hidden", {
  variants: {
    size: {
      goldfish: "p-0",
      salmon: "",
      whale: "",
    },
    orientation: {
      vertical: "flex-col",
      horizontal:
        "flex-col flounder:flex-row pt-6 pb-8 gap-6 flounder:py-0 flounder:px-8",
    },
    bordered: {
      true: "border border-itemPrimaryMute",
      false: "",
    },
    url: {
      true: "hover:bg-backgroundPrimaryHighlight transition-colors duration-300 ease-in-out",
      false: "",
    },
  },
  compoundVariants: [
    {
      orientation: "vertical",
      size: "salmon",
      className: "pt-4 gap-2 pb-5 flounder:gap-4 flounder:pt-6 flounder:pb-7",
    },
    {
      orientation: "vertical",
      size: "whale",
      className: "pt-6 pb-8 flounder:pt-10 flounder:pb-14 gap-6",
    },
  ],
  defaultVariants: {
    size: "salmon",
    bordered: true,
    orientation: "vertical",
  },
});

export const iconIndentVariants = cva("", {
  variants: {
    size: {
      goldfish: "",
      salmon: "",
      whale: "",
    },
    orientation: {
      vertical: "",
      horizontal: "px-5 flounder:px-0 flounder:py-6",
    },
  },
  compoundVariants: [
    {
      orientation: "vertical",
      size: "salmon",
      className: "px-5",
    },
    {
      orientation: "vertical",
      size: "whale",
      className: "px-5 salmon:px-6",
    },
  ],
  defaultVariants: {
    size: "salmon",
    orientation: "vertical",
  },
});

export const contentIndentVariants = cva("", {
  variants: {
    size: {
      goldfish: "",
      salmon: "",
      whale: "",
    },
    orientation: {
      vertical: "",
      horizontal: "px-6 flounder:px-0 flounder:py-8 space-y-2 salmon:space-y-4",
    },
  },
  compoundVariants: [
    {
      orientation: "vertical",
      size: "salmon",
      className: "px-6 space-y-2",
    },
    {
      orientation: "vertical",
      size: "whale",
      className: "px-6 space-y-2 salmon:space-y-4 salmon:px-8",
    },
  ],
  defaultVariants: {
    size: "salmon",
    orientation: "vertical",
  },
});
