import { useFieldState } from "@babylonlabs-io/bbn-core-ui";
import { type PropsWithChildren } from "react";
import { twJoin, twMerge } from "tailwind-merge";

interface OverlayProps {
  className?: string;
}

export function FormOverlay({
  className,
  children,
}: PropsWithChildren<OverlayProps>) {
  const fpState = useFieldState("finalityProvider");

  return (
    <div className={twMerge("relative flex flex-1 flex-col", className)}>
      <div
        className={twJoin(
          `absolute inset-0 bg-secondary-contrast z-10 transition-opacity duration-300`,
          !fpState.invalid && fpState.isTouched
            ? "opacity-0 pointer-events-none"
            : "opacity-75",
        )}
      />
      {children}
    </div>
  );
}
