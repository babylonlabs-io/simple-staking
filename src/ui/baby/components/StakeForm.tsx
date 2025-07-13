import { Button, Form } from "@babylonlabs-io/core-ui";
import { useCallback } from "react";

import bbnIcon from "@/ui/common/assets/bbn.svg";
import { GenericAmountSubsection } from "@/ui/common/components/Common/GenericAmountSubsection/GenericAmountSubsection";
import { GenericProviderField } from "@/ui/common/components/Common/GenericProviderField/GenericProviderField";
import { GenericSubmitButton } from "@/ui/common/components/Common/GenericSubmitButton/GenericSubmitButton";
import { SubSection } from "@/ui/common/components/Multistaking/MultistakingForm/SubSection";
import { useCosmosWallet } from "@/ui/common/context/wallet/CosmosWalletProvider";
import { useEpochingService } from "@/ui/legacy/hooks/services/useEpochingService";
import { babyToUbbn } from "@/ui/legacy/utils/bbn";

import {
  BabyStakingState,
  useBabyStakingState,
  type BabyStakingFormFields,
} from "../state/BabyStakingState";

import { BabyAmountBalanceInfo } from "./BabyAmountBalanceInfo";

interface Validator {
  operatorAddress: string;
  description?: {
    moniker: string;
  };
}

interface StakeFormProps {
  validators: Validator[];
  onStakeSuccess?: () => void;
}

interface Provider {
  id: string;
  name: string;
  description?: string;
}

function StakeFormContent({ validators, onStakeSuccess }: StakeFormProps) {
  const { validationSchema, processing, setProcessing } = useBabyStakingState();
  const { bech32Address, connected, open } = useCosmosWallet();
  const { stake } = useEpochingService();

  const handleSubmit = useCallback(
    async (formValues: BabyStakingFormFields) => {
      if (!connected) {
        open();
        return;
      }

      if (!bech32Address) return;

      setProcessing(true);
      try {
        const ubbnAmount = babyToUbbn(formValues.amount);
        await stake(bech32Address, formValues.validatorAddress, {
          denom: "ubbn",
          amount: ubbnAmount.toString(),
        });

        if (onStakeSuccess) {
          onStakeSuccess();
        }
      } catch (error: any) {
        console.error("Staking failed:", error);
        // Error handling can be improved here
      } finally {
        setProcessing(false);
      }
    },
    [connected, open, bech32Address, stake, setProcessing, onStakeSuccess],
  );

  const handleConnectWallet = () => {
    open();
  };

  const transformedValidators: Provider[] = validators.map((validator) => ({
    id: validator.operatorAddress,
    name: validator.description?.moniker || validator.operatorAddress,
    description: validator.operatorAddress,
  }));

  const renderValidatorList = (
    providers: Provider[],
    onSelect: (id: string) => void,
    selectedId?: string,
  ) => (
    <div className="space-y-2">
      {providers.map((provider) => (
        <div
          key={provider.id}
          className={`p-4 border rounded cursor-pointer transition-colors ${
            selectedId === provider.id
              ? "border-primary bg-primary/10"
              : "border-border hover:bg-secondary"
          }`}
          onClick={() => onSelect(provider.id)}
        >
          <div className="font-medium">{provider.name}</div>
          {provider.description && (
            <div className="text-sm text-muted-foreground mt-1">
              {provider.description}
            </div>
          )}
        </div>
      ))}
    </div>
  );

  const renderBalanceInfo = () => <BabyAmountBalanceInfo />;

  if (!validationSchema) {
    return (
      <SubSection>
        <div className="text-center">Loading...</div>
      </SubSection>
    );
  }

  return (
    <Form
      schema={validationSchema}
      mode="onChange"
      reValidateMode="onChange"
      onSubmit={handleSubmit}
    >
      <div className="flex flex-col gap-2">
        <GenericProviderField
          fieldName="validatorAddress"
          max={1}
          title="Select Validator"
          providers={transformedValidators}
          modalTitle="Select Validator"
          modalDescription="Choose a validator to delegate your tBABY tokens to. Validators help secure the network and you'll earn rewards for delegating to them."
          renderProviderList={renderValidatorList}
        />

        <GenericAmountSubsection
          fieldName="amount"
          currencyIcon={bbnIcon}
          currencyName="BABY"
          placeholder="Enter Amount"
          renderBalanceInfo={renderBalanceInfo}
        />

        {connected ? (
          <GenericSubmitButton
            text="Stake tBABY"
            loadingText="Staking..."
            disabled={processing}
          />
        ) : (
          <Button onClick={handleConnectWallet} className="w-full mt-2">
            Connect Wallet
          </Button>
        )}
      </div>
    </Form>
  );
}

export function StakeForm(props: StakeFormProps) {
  return (
    <BabyStakingState>
      <StakeFormContent {...props} />
    </BabyStakingState>
  );
}
