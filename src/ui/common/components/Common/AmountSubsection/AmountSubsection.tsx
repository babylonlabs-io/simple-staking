import { HiddenField, useFormContext, useWatch } from "@babylonlabs-io/core-ui";

import { AuthGuard } from "@/ui/common/components/Common/AuthGuard";
import { SubSection } from "@/ui/common/components/Multistaking/MultistakingForm/SubSection";

import { AmountBalanceInfo } from "./AmountBalanceInfo";

interface BalanceDetails {
  balance: number | string;
  symbol: string;
  price?: number;
  displayUSD?: boolean;
  decimals?: number;
}

interface Props {
  fieldName: string;
  currencyIcon: string;
  currencyName: string;
  placeholder?: string;
  balanceDetails?: BalanceDetails;
  min?: string;
  step?: string;
  autoFocus?: boolean;
}

export const AmountSubsection = ({
  fieldName,
  currencyIcon,
  currencyName,
  placeholder = "Enter Amount",
  balanceDetails,
  min = "0",
  step = "any",
  autoFocus = true,
}: Props) => {
  const amount = useWatch({ name: fieldName, defaultValue: "" });
  const { setValue } = useFormContext();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(fieldName, e.target.value, {
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
            src={currencyIcon}
            alt={currencyName}
            className="max-w-[2.5rem] max-h-[2.5rem] w-10 h-10"
          />
          <div className="text-lg">{currencyName}</div>
        </div>
        <input
          type="number"
          value={amount ?? ""}
          min={min}
          step={step}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          autoFocus={autoFocus}
          className="text-lg bg-transparent text-right w-2/3 outline-none"
        />
      </div>
      <HiddenField name={fieldName} defaultValue="" />

      {balanceDetails && (
        <AuthGuard>
          <AmountBalanceInfo
            balance={balanceDetails.balance}
            symbol={balanceDetails.symbol}
            price={balanceDetails.price}
            displayUSD={balanceDetails.displayUSD}
            decimals={balanceDetails.decimals ?? 8}
            fieldName={fieldName}
          />
        </AuthGuard>
      )}
    </SubSection>
  );
};
