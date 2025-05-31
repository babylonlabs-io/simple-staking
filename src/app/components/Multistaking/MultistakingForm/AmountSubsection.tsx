import { HiddenField, useFormContext, useWatch } from "@babylonlabs-io/core-ui";

import bitcoin from "@/app/assets/bitcoin.png";
import { AuthGuard } from "@/components/common/AuthGuard";

import { AmountBalanceInfo } from "./AmountBalanceInfo";
import { SubSection } from "./SubSection";

export const AmountSubsection = () => {
  const btcAmount = useWatch({ name: "amount", defaultValue: "0" });
  const { setValue } = useFormContext();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue("amount", e.target.value, {
      shouldValidate: true,
      shouldDirty: true,
      shouldTouch: true,
    });
  };

  return (
    <SubSection className="flex flex-col justify-between w-full content-center gap-4">
      <div className="font-normal items-center flex flex-row justify-between w-full content-center">
        <div className="flex items-center gap-2">
          <img
            src={bitcoin.src}
            alt="bitcoin"
            className="max-w-[40px] max-h-[40px]"
          />
          <div className="text-lg">Bitcoin</div>
        </div>
        <input
          type="number"
          value={btcAmount || ""}
          onChange={handleInputChange}
          placeholder="0"
          autoFocus
          className="text-lg bg-transparent text-right w-2/3 outline-none"
        />
      </div>
      <HiddenField name="amount" />

      <AuthGuard>
        <AmountBalanceInfo />
      </AuthGuard>
    </SubSection>
  );
};
