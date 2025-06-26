import { useFieldState } from "@babylonlabs-io/core-ui";
import { type PropsWithChildren } from "react";
import { twJoin, twMerge } from "tailwind-merge";

interface OverlayProps {
  className?: string;
}

export function FormOverlay({
  className,
  children,
}: PropsWithChildren<OverlayProps>) {
  const fpState = useFieldState("finalityProviders");
  const available = !fpState.invalid && fpState.isTouched;

  return (
    <div
      className={twMerge(
        "relative flex flex-1 flex-col",
        available ? "opacity-100" : "opacity-50",
        className,
      )}
    >
      <div
        className={twJoin(
          `absolute inset-0 z-10 transition-opacity duration-300`,
          available ? "hidden" : "block",
        )}
      />
      {children}
    </div>
  );
}
