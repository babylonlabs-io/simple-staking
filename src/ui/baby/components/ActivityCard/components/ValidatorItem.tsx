import { Avatar, Text } from "@babylonlabs-io/core-ui";

interface ValidatorItemProps {
  logo?: string;
  name: string;
}

export const ValidatorItem = ({ logo, name }: ValidatorItemProps) => (
  <div className="inline-flex items-center gap-1">
    <Text as="span" className="text-accent-primary">
      {name}
    </Text>
    {logo && <Avatar size="tiny" url={logo} alt={name} />}
  </div>
);
