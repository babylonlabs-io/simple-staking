import { Button, useFormState } from "@babylonlabs-io/core-ui";
import { Tooltip } from "react-tooltip";

import { getNetworkConfigBBN } from "@/ui/config/network/bbn";
import { BBN_FEE_AMOUNT } from "@/ui/constants";
import { useBbnQuery } from "@/ui/hooks/client/rpc/queries/useBbnQuery";

const { coinSymbol } = getNetworkConfigBBN();

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
    (bbnBalance === 0
      ? `Insufficient ${coinSymbol} Balance in Babylon Wallet${BBN_FEE_AMOUNT ? `.\n${BBN_FEE_AMOUNT} ${coinSymbol} required for network fees.` : ""}`
      : "");

  return (
    <span
      className="cursor-pointer text-xs mt-8"
      data-tooltip-id="tooltip-staking-preview"
      data-tooltip-content={invalid ? tooltip : ""}
      data-tooltip-place="top"
    >
      <Button
        //@ts-expect-error - fix type issue in core-ui
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
