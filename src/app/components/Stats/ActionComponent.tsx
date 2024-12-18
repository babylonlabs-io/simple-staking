import { Button, Loader } from "@babylonlabs-io/bbn-core-ui";

interface ActionComponentProps {
  title: string;
  onAction: () => void;
  awaitingResponse?: boolean;
}

export function ActionComponent({
  title,
  onAction,
  awaitingResponse,
}: ActionComponentProps) {
  return (
    <Button variant="outlined" size="small" onClick={onAction}>
      {awaitingResponse ? <Loader size={16} className="text-white" /> : title}
    </Button>
  );
}