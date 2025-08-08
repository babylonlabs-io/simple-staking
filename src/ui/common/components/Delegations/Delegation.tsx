import { FaBitcoin } from "react-icons/fa";

import { Hint } from "@/ui/common/components/Common/Hint";
import { DelegationActions } from "@/ui/common/components/Delegations/DelegationActions";
import { getNetworkConfigBTC } from "@/ui/common/config/network/btc";
import { DOCUMENTATION_LINKS } from "@/ui/common/constants";
import { useFinalityProviderState } from "@/ui/common/state/FinalityProviderState";
import {
  DelegationState as DelegationStateEnum,
  type Delegation as DelegationInterface,
} from "@/ui/common/types/delegations";
import { FinalityProviderState } from "@/ui/common/types/finalityProviders";
import { satoshiToBtc } from "@/ui/common/utils/btc";
import { getState, getStateTooltip } from "@/ui/common/utils/getState";
import { maxDecimals } from "@/ui/common/utils/maxDecimals";
import { compactDuration, durationTillNow } from "@/ui/common/utils/time";
import { trim } from "@/ui/common/utils/trim";

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

const { coinSymbol, mempoolApiUrl } = getNetworkConfigBTC();

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
            <a
              className="text-error-main"
              target="_blank"
              href={DOCUMENTATION_LINKS.TECHNICAL_PRELIMINARIES}
            >
              Learn more
            </a>
          </span>
        }
        status="error"
      >
        <span className="text-error-main truncate" title={fpName}>
          {fpName}
        </span>
      </Hint>
    );
  }

  if (isJailed) {
    return (
      <Hint
        tooltip={
          <span>
            This finality provider has been jailed.{" "}
            <a
              className="text-secondary-main"
              target="_blank"
              href={DOCUMENTATION_LINKS.TECHNICAL_PRELIMINARIES}
            >
              Learn more
            </a>
          </span>
        }
        status="error"
      >
        <span className="text-error-main truncate" title={fpName}>
          {fpName}
        </span>
      </Hint>
    );
  }

  return (
    <span className="truncate" title={fpName}>
      {fpName}
    </span>
  );
};

const DelegationState: React.FC<{
  displayState: string;
  isSlashed: boolean;
  isFPRegistered: boolean;
}> = ({ displayState, isSlashed, isFPRegistered }) => {
  const renderStateTooltip = () => {
    if (!isFPRegistered) {
      return "Your Finality Provider is not registered on Babylon Genesis. You need to wait for their registration to become eligible to register your stake to Babylon Genesis";
    }

    if (isSlashed) {
      return (
        <span>
          This finality provider has been slashed.{" "}
          <a
            className="text-secondary-main"
            target="_blank"
            href={DOCUMENTATION_LINKS.TECHNICAL_PRELIMINARIES}
          >
            Learn more
          </a>
        </span>
      );
    }

    if (displayState === DelegationStateEnum.OVERFLOW) {
      return "Stake was over the Phase-1 staking cap it was created in";
    }

    return getStateTooltip(displayState);
  };

  const renderState = () => {
    if (isSlashed) {
      return <span className="text-error-main text-xs">Slashed</span>;
    }
    return <span className="text-xs">{getState(displayState)}</span>;
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

  const displayState =
    isOverflow && isActive
      ? DelegationStateEnum.OVERFLOW
      : intermediateState || state;

  return (
    <>
      <tr className="bg-surface odd:bg-secondary-highlight text-sm text-accent-primary">
        <DelegationCell>
          <div className="flex flex-col">
            <span>
              {compactDuration(durationTillNow(startTimestamp, currentTime))}
            </span>
            <DelegationState
              displayState={displayState}
              isSlashed={isSlashed}
              isFPRegistered={isFpRegistered}
            />
          </div>
        </DelegationCell>

        <DelegationCell className="max-w-[12rem] truncate">
          <FinalityProviderDisplay
            fpName={fpName}
            isSlashed={isSlashed}
            isJailed={isJailed}
          />
        </DelegationCell>

        <DelegationCell className="min-w-[8rem]">
          <div className="flex gap-1 items-center">
            <FaBitcoin className="text-primary" />
            <p>
              {maxDecimals(satoshiToBtc(stakingValueSat), 8)} {coinSymbol}
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

        <DelegationCell>
          <DelegationActions
            state={state}
            intermediateState={intermediateState}
            isEligibleForRegistration={isEligibleForTransition}
            isFpRegistered={isFpRegistered}
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
