import type { PropsWithChildren } from "react";
import { twMerge } from "tailwind-merge";

export const Content = ({
  children,
  className,
}: PropsWithChildren<{ className?: string }>) => (
  <main className={twMerge("w-full md:max-w-3xl md:mx-auto", className)}>
    {children}
  </main>
);
