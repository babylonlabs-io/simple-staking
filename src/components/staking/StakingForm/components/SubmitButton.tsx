import { Button, useFormState } from "@babylonlabs-io/core-ui";
import { Tooltip } from "react-tooltip";

import { BBN_FEE_AMOUNT } from "@/app/constants";
import { useBbnQuery } from "@/app/hooks/client/rpc/queries/useBbnQuery";
import { getNetworkConfigBBN } from "@/config/network/bbn";

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
      className="cursor-pointer text-xs mt-px"
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
