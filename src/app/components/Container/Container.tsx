import { createElement, type PropsWithChildren } from "react";
import { twMerge } from "tailwind-merge";

interface ContainerProps {
  className?: string;
  as?: string;
}

export const Container = ({
  as = "div",
  className,
  children,
}: PropsWithChildren<ContainerProps>) =>
  createElement(
    as,
    { className: twMerge("container px-4 mx-auto sm:px-0", className) },
    children,
  );
