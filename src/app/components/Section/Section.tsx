import { Heading } from "@babylonlabs-io/core-ui";
import { PropsWithChildren } from "react";
import { twMerge } from "tailwind-merge";

interface SectionProps {
  className?: string;
  titleClassName?: string;
  title: string;
}

export function Section({
  className,
  titleClassName,
  title,
  children,
}: PropsWithChildren<SectionProps>) {
  return (
    <section className={className}>
      <Heading
        as="h3"
        variant="h5"
        className={twMerge("text-h5 capitalize mb-4 md:mb-6", titleClassName)}
      >
        {title}
      </Heading>

      {children}
    </section>
  );
}
