import Link from "next/link";
import { useEffect, useState } from "react";
import { FaBitcoin } from "react-icons/fa";

import { DelegationActions } from "@/app/components/Delegations/DelegationActions";
import { RegistrationEndModal } from "@/app/components/Modals/RegistrationModal/RegistrationEndModal";
import { RegistrationStartModal } from "@/app/components/Modals/RegistrationModal/RegistrationStartModal";
import { SignModal } from "@/app/components/Modals/SignModal/SignModal";
import { DOCUMENTATION_LINKS, ONE_MINUTE } from "@/app/constants";
import { useRegistrationService } from "@/app/hooks/services/useRegistrationService";
import { useDelegationState } from "@/app/state/DelegationState";
import { useFinalityProviderState } from "@/app/state/FinalityProviderState";
import {
  type Delegation as DelegationInterface,
  DelegationState as DelegationStateEnum,
} from "@/app/types/delegations";
import { FinalityProviderState } from "@/app/types/finalityProviders";
import { Hint } from "@/components/common/Hint";
import { getNetworkConfigBTC } from "@/config/network/btc";
import { satoshiToBtc } from "@/utils/btc";
import { getState, getStateTooltip } from "@/utils/getState";
import { maxDecimals } from "@/utils/maxDecimals";
import { durationTillNow } from "@/utils/time";
import { trim } from "@/utils/trim";

import { VerificationModal } from "../Modals/VerificationModal";

import { DelegationCell } from "./components/DelegationCell";

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

interface FinalityProviderDisplayProps {
  fpName: string;
  isSlashed: boolean;
  isJailed: boolean;
}

const FinalityProviderDisplay: React.FC<FinalityProviderDisplayProps> = ({
  fpName,
  isSlashed,
  isJailed,
}) => {
  if (isSlashed) {
    return (
      <Hint
        tooltip={
          <span>
            This finality provider has been slashed.{" "}
            <Link
              className="text-error-main"
              target="_blank"
              href={DOCUMENTATION_LINKS.TECHNICAL_PRELIMINARIES}
            >
              Learn more
            </Link>
          </span>
        }
        status="error"
      >
        <span className="text-error-main">{fpName}</span>
      </Hint>
    );
  }

  if (isJailed) {
    return (
      <Hint
        tooltip={
          <span>
            This finality provider has been jailed.{" "}
            <Link
              className="text-secondary-main"
              target="_blank"
              href={DOCUMENTATION_LINKS.TECHNICAL_PRELIMINARIES}
            >
              Learn more
            </Link>
          </span>
        }
        status="error"
      >
        <span className="text-error-main">{fpName}</span>
      </Hint>
    );
  }

  return <>{fpName}</>;
};

const DelegationState: React.FC<{
  displayState: string;
  isSlashed: boolean;
}> = ({ displayState, isSlashed }) => {
  const renderStateTooltip = () => {
    if (isSlashed) {
      return (
        <span>
          This finality provider has been slashed.{" "}
          <Link
            className="text-secondary-main"
            target="_blank"
            href={DOCUMENTATION_LINKS.TECHNICAL_PRELIMINARIES}
          >
            Learn more
          </Link>
        </span>
      );
    }

    if (displayState === DelegationStateEnum.OVERFLOW) {
      return "Stake is over the staking cap";
    }
    return getStateTooltip(displayState);
  };

  const renderState = () => {
    if (isSlashed) {
      return <span className="text-error-main">Slashed</span>;
    }
    return getState(displayState);
  };

  return (
    <Hint
      tooltip={renderStateTooltip()}
      status={isSlashed ? "warning" : "default"}
    >
      {renderState()}
    </Hint>
  );
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
  const { getFinalityProvider, getFinalityProviderName } =
    useFinalityProviderState();
  const { coinName, mempoolApiUrl } = getNetworkConfigBTC();

  const finalityProvider = getFinalityProvider(finalityProviderPkHex);
  const fpState = finalityProvider?.state;
  const fpName = getFinalityProviderName(finalityProviderPkHex) ?? "-";

  const isActive = state === DelegationStateEnum.ACTIVE;
  const isSlashed = fpState === FinalityProviderState.SLASHED;
  const isJailed = fpState === FinalityProviderState.JAILED;

  const displayState =
    isOverflow && isActive
      ? DelegationStateEnum.OVERFLOW
      : intermediateState || state;

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

  return (
    <>
      <tr className="bg-surface odd:bg-secondary-highlight text-sm text-accent-primary">
        <DelegationCell>
          {durationTillNow(startTimestamp, currentTime)}
        </DelegationCell>

        <DelegationCell>
          <FinalityProviderDisplay
            fpName={fpName}
            isSlashed={isSlashed}
            isJailed={isJailed}
          />
        </DelegationCell>

        <DelegationCell>
          <div className="flex gap-1 items-center">
            <FaBitcoin className="text-primary" />
            <p>
              {maxDecimals(satoshiToBtc(stakingValueSat), 8)} {coinName}
            </p>
          </div>
        </DelegationCell>

        <DelegationCell>
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
        <DelegationCell>
          <DelegationState displayState={displayState} isSlashed={isSlashed} />
        </DelegationCell>

        <DelegationCell>
          <DelegationActions
            state={state}
            intermediateState={intermediateState}
            isEligibleForRegistration={isEligibleForTransition}
            stakingTxHashHex={stakingTxHashHex}
            finalityProviderPkHex={finalityProviderPkHex}
            onRegistration={onRegistration}
            onUnbond={onUnbond}
            onWithdraw={onWithdraw}
          />
        </DelegationCell>
      </tr>

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
