import { Text } from "@babylonlabs-io/bbn-core-ui";
import type { PropsWithChildren, ReactNode } from "react";
import { IoCheckmarkSharp } from "react-icons/io5";
import { twMerge } from "tailwind-merge";

interface StepProps {
  index: number;
  state: "completed" | "processing" | "upcoming";
  children: ReactNode;
}

export const Step = ({
  index,
  state,
  children,
}: PropsWithChildren<StepProps>) => (
  <div
    className={twMerge(
      "p-4 flex flex-row items-center justify-start gap-3 rounded border border-primary-dark/20 bg-secondary-contrast self-stretch",
      state !== "processing" && "opacity-25",
    )}
  >
    {state === "completed" ? (
      <div className="rounded-full bg-primary-light flex h-10 w-10 items-center justify-center">
        <IoCheckmarkSharp size={24} className="text-secondary-contrast" />
      </div>
    ) : (
      <div className="rounded-full bg-secondary-main flex h-10 w-10 items-center justify-center">
        <Text variant="body1" className="text-secondary-contrast">
          {index}
        </Text>
      </div>
    )}

    <Text variant="body1" className="text-primary-dark">
      Step {index}: {children}
    </Text>
  </div>
);
