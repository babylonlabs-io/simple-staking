import { Heading, Text } from "@babylonlabs-io/bbn-core-ui";

export const StatusView = ({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode | string;
  title: string;
  description?: React.ReactNode;
}) => (
  <div className="flex items-center justify-center h-[21rem]">
    <div className="flex flex-col items-center gap-4">
      <div className="bg-primary-contrast relative w-[5.5rem] h-[5.5rem]">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          {icon}
        </div>
      </div>
      <Heading variant="h6" className="text-primary-dark">
        {title}
      </Heading>
      {description && (
        <Text variant="body1" className="text-primary-dark text-center">
          {description}
        </Text>
      )}
    </div>
  </div>
);
