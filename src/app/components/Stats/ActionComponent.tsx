import { Button, LoadingIcon } from "@/ui";

interface ActionComponentProps {
  title: string;
  onAction: () => void;
  awaitingResponse?: boolean;
  isDisabled?: boolean;
  className?: string;
}

export function ActionComponent({
  title,
  onAction,
  awaitingResponse,
  isDisabled,
  className,
}: ActionComponentProps) {
  return (
    <Button
      className={className}
      variant="outline"
      size="xs"
      application
      onClick={onAction}
      disabled={isDisabled}
    >
      {awaitingResponse ? <LoadingIcon size="goldfish" /> : title}
    </Button>
  );
}
