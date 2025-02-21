import { Heading, Text } from "@babylonlabs-io/bbn-core-ui";
import { twMerge } from "tailwind-merge";

interface StatusViewProps {
  icon: React.ReactNode | string;
  title: string;
  description?: React.ReactNode;
  className?: string;
}

export const StatusView = ({
  icon,
  title,
  description,
  className,
}: StatusViewProps) => (
  <div
    className={twMerge("flex items-center justify-center h-[21rem]", className)}
  >
    <div className="flex flex-col items-center gap-4">
      <div className="bg-primary-contrast relative w-[5.5rem] h-[5.5rem]">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          {icon}
        </div>
      </div>
      <Heading variant="h6" className="text-accent-primary">
        {title}
      </Heading>
      {description && (
        <Text variant="body1" className="text-accent-primary text-center">
          {description}
        </Text>
      )}
    </div>
  </div>
);
