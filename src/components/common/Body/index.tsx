"use client";

import type { DetailedHTMLProps, HTMLAttributes } from "react";
import { twJoin } from "tailwind-merge";

import { useAppState } from "@/app/state";

export const Body = ({
  className,
  ...props
}: DetailedHTMLProps<HTMLAttributes<HTMLBodyElement>, HTMLBodyElement>) => {
  const { theme } = useAppState();

  return <body {...props} className={twJoin("font-sans", className, theme)} />;
};
