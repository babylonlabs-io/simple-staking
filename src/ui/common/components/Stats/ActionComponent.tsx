import { Button, Loader } from "@babylonlabs-io/core-ui";

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
      variant="outlined"
      size="small"
      onClick={onAction}
      disabled={isDisabled}
    >
      {awaitingResponse ? <Loader size={16} className="text-white" /> : title}
    </Button>
  );
}
