import {
  Heading,
  HiddenField,
  Loader,
  Text,
} from "@babylonlabs-io/bbn-core-ui";

import { StatusView } from "@/app/components/Staking/FinalityProviders/FinalityProviderTableStatusView";
import apiNotAvailable from "@/app/components/Staking/Form/States/api-not-available.svg";
import { Message } from "@/app/components/Staking/Form/States/Message";
import stakingNotStartedIcon from "@/app/components/Staking/Form/States/staking-not-started.svg";
import walletIcon from "@/app/components/Staking/Form/States/wallet-icon.svg";
import { WalletNotConnected } from "@/app/components/Staking/Form/States/WalletNotConnected";
import { BBN_FEE_AMOUNT } from "@/app/constants";
import { AuthGuard } from "@/components/common/AuthGuard";

import { AmountField } from "./components/AmountField";
import { BBNFeeAmount } from "./components/BBNFeeAmount";
import { BTCFeeAmount } from "./components/BTCFeeAmount";
import { BTCFeeRate } from "./components/BTCFeeRate";
import { FeeSection } from "./components/FeeSection";
import { InfoAlert } from "./components/InfoAlert";
import { FormOverlay } from "./components/Overlay";
import { SubmitButton } from "./components/SubmitButton";
import { TermField } from "./components/TermField";
import { Total } from "./components/Total";

interface DelegationFormProps {
  loading?: boolean;
  blocked?: boolean;
  available?: boolean;
  hasError?: boolean;
  error?: string;
  stakingInfo?: {
    minFeeRate: number;
    maxFeeRate: number;
    defaultFeeRate: number;
    minStakingTimeBlocks: number;
    maxStakingTimeBlocks: number;
    minStakingAmountSat: number;
    maxStakingAmountSat: number;
    defaultStakingTimeBlocks?: number;
  };
}

export function DelegationForm({
  loading,
  blocked,
  available,
  hasError,
  error,
  stakingInfo,
}: DelegationFormProps) {
  if (loading) {
    return (
      <StatusView
        className="flex-1 h-auto"
        icon={<Loader className="text-primary-light" />}
        title="Please wait..."
      />
    );
  }

  if (blocked) {
    return (
      <Message
        icon={walletIcon}
        title="Unavailable in Your Region"
        message={error ?? ""}
      />
    );
  }

  if (!available) {
    return (
      <Message
        title="Staking Temporarily Unavailable"
        message="Staking is not enabled at this time. Please check back later."
        icon={stakingNotStartedIcon}
      />
    );
  }

  if (hasError) {
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
      <div className="relative flex flex-1 flex-col gap-6">
        <Heading variant="h5" className="text-accent-primary">
          Step 2
        </Heading>

        <Text variant="body1" className="text-accent-secondary">
          Set Staking Amount
        </Text>

        <InfoAlert />

        <div className="flex flex-1 flex-col">
          <FormOverlay>
            <TermField
              defaultValue={stakingInfo?.defaultStakingTimeBlocks}
              min={stakingInfo?.minStakingTimeBlocks}
              max={stakingInfo?.maxStakingTimeBlocks}
            />

            <AmountField
              min={stakingInfo?.minStakingAmountSat}
              max={stakingInfo?.maxStakingAmountSat}
            />

            <HiddenField name="feeRate" defaultValue="0" />

            <HiddenField name="feeAmount" defaultValue="0" />

            <FeeSection>
              <div className="flex flex-col gap-4 mt-4">
                <BTCFeeRate defaultRate={stakingInfo?.defaultFeeRate} />
                <BTCFeeAmount />
                {BBN_FEE_AMOUNT && <BBNFeeAmount amount={BBN_FEE_AMOUNT} />}
              </div>

              <div className="divider my-4" />

              <Total />
            </FeeSection>
          </FormOverlay>

          <SubmitButton />
        </div>
      </div>
    </AuthGuard>
  );
}
