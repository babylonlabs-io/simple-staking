import { Text } from "@babylonlabs-io/bbn-core-ui";
import { twMerge } from "tailwind-merge";

import { Tick } from "./Tick";

export const Step = ({
  active,
  completed,
  current,
  content,
}: {
  active: boolean;
  completed: boolean;
  current: number;
  content: string;
}) => (
  <div
    className={twMerge(
      "p-4 flex flex-row items-center justify-start gap-3 rounded border border-primary-dark/20 bg-secondary-contrast self-stretch",
      !active && "opacity-25",
    )}
  >
    {completed ? (
      <Tick />
    ) : (
      <div className="rounded-full bg-secondary-main flex h-10 w-10 items-center justify-center">
        <Text variant="body1" className="text-secondary-contrast">
          {current}
        </Text>
      </div>
    )}
    <Text variant="body1" className="text-primary-dark">
      {content}
    </Text>
  </div>
);
