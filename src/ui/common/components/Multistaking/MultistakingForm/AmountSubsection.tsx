import { HiddenField, useFormContext, useWatch } from "@babylonlabs-io/core-ui";

import { AuthGuard } from "@/ui/common/components/Common/AuthGuard";
import { getNetworkConfigBTC } from "@/ui/common/config/network/btc";

import { AmountBalanceInfo } from "./AmountBalanceInfo";
import { SubSection } from "./SubSection";

const { icon, name } = getNetworkConfigBTC();

export const AmountSubsection = () => {
  const btcAmount = useWatch({ name: "amount", defaultValue: "" });
  const { setValue } = useFormContext();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue("amount", e.target.value, {
      shouldValidate: true,
      shouldDirty: true,
      shouldTouch: true,
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowUp" || e.key === "ArrowDown") {
      e.preventDefault();
    }
  };

  return (
    <SubSection className="flex flex-col justify-between w-full content-center gap-4">
      <div className="font-normal items-center flex flex-row justify-between w-full content-center">
        <div className="flex items-center gap-2">
          <img
            src={icon}
            alt={name}
            className="max-w-[2.5rem] max-h-[2.5rem] w-10 h-10"
          />
          <div className="text-lg">{name}</div>
        </div>
        <input
          type="number"
          value={btcAmount ?? ""}
          min="0"
          step="any"
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder="Enter Amount"
          autoFocus
          className="text-lg bg-transparent text-right w-2/3 outline-none"
        />
      </div>
      <HiddenField name="amount" defaultValue="" />

      <AuthGuard>
        <AmountBalanceInfo />
      </AuthGuard>
    </SubSection>
  );
};
