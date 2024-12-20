import { Button, useFormState } from "@babylonlabs-io/bbn-core-ui";
import { Tooltip } from "react-tooltip";

import { useBbnQuery } from "@/app/hooks/client/rpc/queries/useBbnQuery";

export function SubmitButton() {
  const { isValid } = useFormState();
  // TODO: improve later
  const {
    balanceQuery: { data: bbnBalance = 0 },
  } = useBbnQuery();

  return (
    <span
      className="cursor-pointer text-xs mt-4"
      data-tooltip-id="tooltip-staking-preview"
      data-tooltip-content=""
      data-tooltip-place="top"
    >
      <Button
        type="submit"
        disabled={!isValid || bbnBalance === 0}
        size="large"
        fluid
      >
        Preview
      </Button>

      <Tooltip id="tooltip-staking-preview" className="tooltip-wrap" />
    </span>
  );
}
