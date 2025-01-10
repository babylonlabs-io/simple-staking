import { useEffect, useState } from "react";
import { FaBitcoin } from "react-icons/fa";

import { DelegationActions } from "@/app/components/Delegations/DelegationActions";
import { RegistrationEndModal } from "@/app/components/Modals/RegistrationModal/RegistrationEndModal";
import { RegistrationStartModal } from "@/app/components/Modals/RegistrationModal/RegistrationStartModal";
import { SignModal } from "@/app/components/Modals/SignModal/SignModal";
import { ONE_MINUTE } from "@/app/constants";
import { useRegistrationService } from "@/app/hooks/services/useRegistrationService";
import { useDelegationState } from "@/app/state/DelegationState";
import { useFinalityProviderState } from "@/app/state/FinalityProviderState";
import {
  type Delegation as DelegationInterface,
  DelegationState,
} from "@/app/types/delegations";
import { getNetworkConfigBTC } from "@/config/network/btc";
import { satoshiToBtc } from "@/utils/btc";
import { getState, getStateTooltip } from "@/utils/getState";
import { maxDecimals } from "@/utils/maxDecimals";
import { durationTillNow } from "@/utils/time";
import { trim } from "@/utils/trim";

import { VerificationModal } from "../Modals/VerificationModal";

import { DelegationCell } from "./components/DelegationCell";
import { DelegationStatus } from "./components/DelegationStatus";

interface DelegationProps {
  delegation: DelegationInterface;
  onWithdraw: (id: string) => void;
  onUnbond: (id: string) => void;
  // This attribute is set when an action has been taken by the user
  // that should change the status but the back-end
  // has not had time to reflect this change yet
  intermediateState?: string;
}

// step index
const REGISTRATION_INDEXES: Record<string, number> = {
  "registration-staking-slashing": 1,
  "registration-unbonding-slashing": 2,
  "registration-proof-of-possession": 3,
  "registration-sign-bbn": 4,
};

const VERIFICATION_STEPS: Record<string, 1 | 2> = {
  "registration-send-bbn": 1,
  "registration-verifying": 2,
};

export const Delegation: React.FC<DelegationProps> = ({
  delegation,
  onWithdraw,
  onUnbond,
  intermediateState,
}) => {
  const {
    stakingTx,
    stakingTxHashHex,
    state,
    stakingValueSat,
    isOverflow,
    finalityProviderPkHex,
    isEligibleForTransition,
  } = delegation;

  const { startTimestamp } = stakingTx;
  const [currentTime, setCurrentTime] = useState(Date.now());
  const {
    processing,
    registrationStep: step,
    setRegistrationStep: setStep,
    setSelectedDelegation,
    resetRegistration: handleCloseRegistration,
  } = useDelegationState();
  const { registerPhase1Delegation } = useRegistrationService();
  const { getFinalityProvider } = useFinalityProviderState();
  const { coinName, mempoolApiUrl } = getNetworkConfigBTC();

  useEffect(() => {
    const timerId = setInterval(() => setCurrentTime(Date.now()), ONE_MINUTE);
    return () => clearInterval(timerId);
  }, []);

  const onRegistration = async () => {
    setSelectedDelegation(delegation);
    setStep("registration-start");
  };

  const handleProceed = async () => {
    await registerPhase1Delegation();
  };

  const isActive =
    intermediateState === DelegationState.ACTIVE ||
    state === DelegationState.ACTIVE;
  const displayState =
    isOverflow && isActive
      ? DelegationState.OVERFLOW
      : intermediateState || state;

  const renderState = () => getState(displayState);
  const renderStateTooltip = () => {
    // overflow state to override the tooltip
    if (isOverflow) {
      return "Stake is over the staking cap";
    }
    return getStateTooltip(displayState);
  };

  return (
    <>
      <div className="relative h-[120px] lg:h-[72px] rounded bg-secondary-contrast odd:bg-[#F9F9F9] p-4 text-sm text-primary-dark">
        <div className="h-full grid grid-flow-col grid-cols-2 grid-rows-3 items-center gap-2 lg:grid-flow-row lg:grid-cols-[1.5fr_1fr_1fr_1fr_1fr_1fr] lg:grid-rows-1">
          <DelegationCell order="order-3 lg:order-1" className="pt-6 lg:pt-0">
            {durationTillNow(startTimestamp, currentTime)}
          </DelegationCell>

          <DelegationCell
            order="order-4 lg:order-2"
            className="pt-6 lg:pt-0 text-right lg:text-left"
          >
            {getFinalityProvider(finalityProviderPkHex)?.description?.moniker ??
              "-"}
          </DelegationCell>

          <DelegationCell
            order="order-1 lg:order-3"
            className="flex gap-1 items-center"
          >
            <FaBitcoin className="text-primary" />
            <p>
              {maxDecimals(satoshiToBtc(stakingValueSat), 8)} {coinName}
            </p>
          </DelegationCell>

          <DelegationCell
            order="order-2 lg:order-4"
            className="justify-start lg:flex"
          >
            <a
              href={`${mempoolApiUrl}/tx/${stakingTxHashHex}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline"
            >
              {trim(stakingTxHashHex)}
            </a>
          </DelegationCell>
          {/*
          we need to center the text without the tooltip
          add its size 12px and gap 4px, 16/2 = 8px
          */}
          <DelegationCell
            order="order-5"
            className="relative flex justify-end lg:justify-start"
          >
            <DelegationStatus
              state={renderState()}
              tooltip={renderStateTooltip()}
              stakingTxHashHex={stakingTxHashHex}
              isOverflow={isOverflow && isActive}
            />
          </DelegationCell>

          <DelegationCell order="order-6">
            <DelegationActions
              state={state}
              intermediateState={intermediateState}
              isEligibleForRegistration={isEligibleForTransition}
              stakingTxHashHex={stakingTxHashHex}
              onRegistration={onRegistration}
              onUnbond={onUnbond}
              onWithdraw={onWithdraw}
            />
          </DelegationCell>
        </div>
      </div>

      <RegistrationStartModal
        open={step === "registration-start"}
        onClose={handleCloseRegistration}
        onProceed={handleProceed}
      />

      {step && Boolean(REGISTRATION_INDEXES[step]) && (
        <SignModal
          open
          title="Transition to Phase 2"
          step={REGISTRATION_INDEXES[step]}
          processing={processing}
        />
      )}

      {step && Boolean(VERIFICATION_STEPS[step]) && (
        <VerificationModal
          open
          processing={processing}
          step={VERIFICATION_STEPS[step]}
        />
      )}

      <RegistrationEndModal
        open={step === "registration-verified"}
        onClose={handleCloseRegistration}
      />
    </>
  );
};
