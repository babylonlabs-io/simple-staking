import { Button, useFormState } from "@babylonlabs-io/bbn-core-ui";
import { Tooltip } from "react-tooltip";

import { useBbnQuery } from "@/app/hooks/client/rpc/queries/useBbnQuery";

export function SubmitButton() {
  const { isValid, errors } = useFormState();
  const {
    balanceQuery: { data: bbnBalance = 0 },
  } = useBbnQuery();

  const [errorMessage] = Object.keys(errors).map(
    (fieldName) => (errors[fieldName]?.message as string) ?? "",
  );

  const invalid = !isValid || bbnBalance === 0;
  const tooltip =
    errorMessage ??
    (bbnBalance === 0 ? "Insufficient BABY Balance in Babylon Wallet" : "");

  return (
    <span
      className="cursor-pointer text-xs mt-8"
      data-tooltip-id="tooltip-staking-preview"
      data-tooltip-content={invalid ? tooltip : ""}
      data-tooltip-place="top"
    >
      <Button
        //@ts-ignore - fix type issue in core-ui
        type="submit"
        disabled={invalid}
        size="large"
        fluid
      >
        Preview
      </Button>

      <Tooltip id="tooltip-staking-preview" className="tooltip-wrap z-50" />
    </span>
  );
}
