import { useFormState } from "@babylonlabs-io/core-ui";
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
      className="cursor-pointer text-xs mt-8"
      data-tooltip-id="tooltip-staking-preview"
      data-tooltip-content={invalid ? tooltip : ""}
      data-tooltip-place="top"
    >
      <button
        //@ts-ignore - fix type issue in core-ui
        type="submit"
        disabled={invalid}
        // size="large"
        // fluid
        className="text-lg bg-transparent border-2 border-[#887957] text-white hover:bg-[#887957] hover:text-[#887957] disabled:bg-[#111111] disabled:text-[#AAAAAA] disabled:border-[#887957] rounded-[8px] font-semiBold"
        style={{
          display: "flex",
          width: "355px",
          height: "42px",
          padding: "0px 12px",
          justifyContent: "center",
          alignItems: "center",
          gap: "8px",
          flexShrink: 0,
        }}
      >
        Preview
      </button>

      <Tooltip id="tooltip-staking-preview" className="tooltip-wrap z-50" />
    </span>
  );
}
