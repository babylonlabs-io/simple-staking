import { type AvatarProps, Avatar, Text } from "@babylonlabs-io/core-ui";

interface ValidatorAvatarProps extends Omit<AvatarProps, "children"> {
  name: string;
}

export function ValidatorAvatar({
  url,
  name,
  variant = "rounded",
  size = "large",
  ...props
}: ValidatorAvatarProps) {
  return (
    <Avatar {...props} url={url} alt={name} variant={variant} size={size}>
      <Text
        as="span"
        className="inline-flex h-full w-full items-center justify-center bg-secondary-main text-xs text-accent-contrast"
      >
        {name?.charAt(0).toUpperCase() || "?"}
      </Text>
    </Avatar>
  );
}
