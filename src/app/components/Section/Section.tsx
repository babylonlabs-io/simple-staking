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
          "text-accent-primary capitalize md:text-[2.125rem] md:leading-[2.625rem] md:tracking-0.25",
          titleClassName,
        )}
        style={{
          paddingBottom: "0.5rem",
          borderBottom: "1px solid",
          borderImage:
            "linear-gradient(90deg, #4F4633 -16.24%, #887957 34%, #060504 97.34%) 1",
        }}
      >
        {title}
      </Heading>
      {children}
    </section>
  );
}
