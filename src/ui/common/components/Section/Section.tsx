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
        className={twMerge(
          "text-accent-primary capitalize mb-4 md:mb-6 md:text-[1.625rem] md:leading-[2.625rem] md:tracking-0.25 font-normal",
          titleClassName,
        )}
      >
        {title}
      </Heading>

      {children}
    </section>
  );
}
