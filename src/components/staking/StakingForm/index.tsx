import { Heading, Loader, Text } from "@babylonlabs-io/bbn-core-ui";
import { useState } from "react";

import { StatusView } from "@/app/components/Staking/FinalityProviders/FinalityProviderTableStatusView";
import apiNotAvailable from "@/app/components/Staking/Form/States/api-not-available.svg";
import { Message } from "@/app/components/Staking/Form/States/Message";
import { WalletNotConnected } from "@/app/components/Staking/Form/States/WalletNotConnected";
import { AuthGuard } from "@/components/common/AuthGuard";

import { AmountField } from "./components/AmountField";
import { FeeAmountField } from "./components/FeeAmountField";
import { FeeInfo } from "./components/FeeInfo";
import { FeeRateField } from "./components/FeeRateField";
import { FeeSection } from "./components/FeeSection";
import { InfoAlert } from "./components/InfoAlert";
import { FormOverlay } from "./components/Overlay";
import { SubmitButton } from "./components/SubmitButton";
import { TermField } from "./components/TermField";

interface DelegationFormProps {
  loading?: boolean;
  disabled?: boolean;
  error?: string;
  stakingInfo?: {
    minFeeRate: number;
    maxFeeRate: number;
    defaultFeeRate: number;
    minStakingTimeBlocks: number;
    maxStakingTimeBlocks: number;
    minStakingAmountSat: number;
    maxStakingAmountSat: number;
  };
}

export function DelegationForm({
  loading,
  disabled,
  error,
  stakingInfo,
}: DelegationFormProps) {
  const [isCustomFee, setIsCustomFee] = useState(false);

  if (loading) {
    return (
      <StatusView className="flex-1" icon={<Loader />} title="Please wait..." />
    );
  }

  if (disabled) {
    // TODO: display error properly https://github.com/babylonlabs-io/simple-staking/commit/6b61dc95e6b86ffa35f274c5dae01c0a5e594b2a
    return (
      <Message
        icon={apiNotAvailable}
        title="Staking is not available"
        message={error ?? ""}
      />
    );
  }

  return (
    <AuthGuard fallback={<WalletNotConnected />}>
      <div className="relative flex flex-1 flex-col gap-4">
        <Heading variant="h5" className="text-primary-dark">
          Step 2
        </Heading>

        <Text variant="body1" className="text-primary-light">
          Set Staking Amount
        </Text>

        <InfoAlert />

        <div className="flex flex-1 flex-col">
          <FormOverlay>
            <TermField
              min={stakingInfo?.minStakingTimeBlocks}
              max={stakingInfo?.maxStakingTimeBlocks}
            />

            <AmountField
              min={stakingInfo?.minStakingAmountSat}
              max={stakingInfo?.maxStakingAmountSat}
            />

            <FeeSection>
              <FeeInfo custom={isCustomFee} />

              <FeeRateField
                expanded={isCustomFee}
                defaultRate={stakingInfo?.defaultFeeRate}
                min={stakingInfo?.minFeeRate}
                max={stakingInfo?.maxFeeRate}
                onExpand={() => void setIsCustomFee(true)}
              />

              <FeeAmountField />
            </FeeSection>
          </FormOverlay>

          <SubmitButton />
        </div>
      </div>
    </AuthGuard>
  );
}
