import { Heading, HiddenField, Loader, Text } from "@babylonlabs-io/core-ui";
import Image from "next/image";

import { StatusView } from "@/app/components/Staking/FinalityProviders/FinalityProviderTableStatusView";
import apiNotAvailable from "@/app/components/Staking/Form/States/api-not-available.svg";
import { Message } from "@/app/components/Staking/Form/States/Message";
import stakingUnavailableIcon from "@/app/components/Staking/Form/States/staking-unavailable.svg";
import walletIcon from "@/app/components/Staking/Form/States/wallet-icon.svg";
import { WalletNotConnected } from "@/app/components/Staking/Form/States/WalletNotConnected";
import { BBN_FEE_AMOUNT } from "@/app/constants";
import { useBalanceState } from "@/app/state/BalanceState";
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
  disabled?: {
    title: string;
    message: string;
  };
}

export function DelegationForm({
  loading,
  blocked,
  disabled,
  hasError,
  error,
  stakingInfo,
}: DelegationFormProps) {
  const { stakableBtcBalance } = useBalanceState();

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
        title="Unavailable in Your Region"
        message={error ?? ""}
        icon={
          <Image
            src={walletIcon}
            alt="Unavailable in Your Region"
            width={120}
            height={122}
            className="rotate-12"
          />
        }
      />
    );
  }

  if (disabled) {
    return (
      <Message
        title={disabled.title}
        message={disabled.message}
        icon={
          <Image
            src={stakingUnavailableIcon}
            alt="Staking Unavailable"
            width={120}
            height={122}
          />
        }
      />
    );
  }

  if (hasError) {
    return (
      <Message
        icon={
          <Image
            src={apiNotAvailable}
            alt="Staking is not available"
            width={120}
            height={122}
            className="rotate-12"
          />
        }
        title="Staking is not available"
        message={error ?? ""}
      />
    );
  }

  const maxAmount = Math.min(
    stakableBtcBalance,
    stakingInfo?.maxStakingAmountSat || 0,
  );

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
              max={maxAmount}
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
