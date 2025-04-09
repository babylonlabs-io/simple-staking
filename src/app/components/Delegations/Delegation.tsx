import Link from "next/link";
import { useMemo } from "react";
import { FaBitcoin } from "react-icons/fa";

import { DelegationActions } from "@/app/components/Delegations/DelegationActions";
import { DOCUMENTATION_LINKS } from "@/app/constants";
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

import { DelegationCell } from "./components/DelegationCell";

interface DelegationProps {
  currentTime: number;
  delegation: DelegationInterface;
  onWithdraw: (id: string) => void;
  onUnbond: (id: string) => void;
  onRegistration: (delegation: DelegationInterface) => Promise<void>;
  // This attribute is set when an action has been taken by the user
  // that should change the status but the back-end
  // has not had time to reflect this change yet
  intermediateState?: string;
}

const { coinName, mempoolApiUrl } = getNetworkConfigBTC();

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
  currentTime,
  delegation,
  onWithdraw,
  onUnbond,
  onRegistration,
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

  const { getRegisteredFinalityProvider, getFinalityProviderName } =
    useFinalityProviderState();

  const finalityProvider = getRegisteredFinalityProvider(finalityProviderPkHex);
  const fpState = finalityProvider?.state;
  const fpName = getFinalityProviderName(finalityProviderPkHex) ?? "-";

  const isActive = state === DelegationStateEnum.ACTIVE;
  const isFpRegistered = finalityProvider !== null;
  const isSlashed = fpState === FinalityProviderState.SLASHED;
  const isJailed = fpState === FinalityProviderState.JAILED;

  const displayState = useMemo(() => {
    if (!isFpRegistered) {
      return DelegationStateEnum.NOT_REGISTERED;
    }

    return isOverflow && isActive
      ? DelegationStateEnum.OVERFLOW
      : intermediateState || state;
  }, [isFpRegistered, isOverflow, isActive, intermediateState, state]);

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
            onRegistration={() => onRegistration(delegation)}
            onUnbond={onUnbond}
            onWithdraw={onWithdraw}
          />
        </DelegationCell>
      </tr>
    </>
  );
};
