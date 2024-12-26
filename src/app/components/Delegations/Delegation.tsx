import { useEffect, useState } from "react";
import { FaBitcoin } from "react-icons/fa";

import { DelegationActions } from "@/app/components/Delegations/DelegationActions";
import { ONE_MINUTE } from "@/app/constants";
import {
  type SigningStep,
  useTransactionService,
} from "@/app/hooks/services/useTransactionService";
import { useHealthCheck } from "@/app/hooks/useHealthCheck";
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

import { DelegationCell } from "./components/DelegationCell";
import { DelegationStatus } from "./components/DelegationStatus";
import { OverflowBadge } from "./components/OverflowBadge";

interface DelegationProps {
  delegation: DelegationInterface;
  onWithdraw: (id: string) => void;
  onUnbond: (id: string) => void;
  // This attribute is set when an action has been taken by the user
  // that should change the status but the back-end
  // has not had time to reflect this change yet
  intermediateState?: string;
}

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
  const { isApiNormal, isGeoBlocked } = useHealthCheck();
  const { transitionPhase1Delegation } = useTransactionService();
  const { getFinalityProvider } = useFinalityProviderState();
  const { coinName, mempoolApiUrl } = getNetworkConfigBTC();

  useEffect(() => {
    const timerId = setInterval(() => setCurrentTime(Date.now()), ONE_MINUTE); // Update every minute
    return () => clearInterval(timerId);
  }, []);

  // TODO: Hook up with the transaction signing modal
  const transitionCallback = async (step: SigningStep) => {
    console.log(step);
  };

  const onTransition = async () => {
    // TODO: Open the transaction signing modal
    await transitionPhase1Delegation(
      stakingTx.txHex,
      stakingTx.startHeight,
      {
        finalityProviderPkNoCoordHex: finalityProviderPkHex,
        stakingAmountSat: stakingValueSat,
        stakingTimelock: stakingTx.timelock,
      },
      transitionCallback,
    );
    // TODO: Close the transaction signing modal and update the UI
  };

  const isActive =
    intermediateState === DelegationState.ACTIVE ||
    state === DelegationState.ACTIVE;
  const displayState =
    isOverflow && isActive
      ? DelegationState.OVERFLOW
      : intermediateState || state;

  const renderState = () => getState(displayState);
  const renderStateTooltip = () => getStateTooltip(displayState);

  return (
    <div className="relative rounded bg-secondary-contrast odd:bg-[#F9F9F9] p-4 text-sm text-primary-dark">
      {isOverflow && <OverflowBadge />}
      <div className="grid grid-flow-col grid-cols-2 grid-rows-3 items-center gap-2 lg:grid-flow-row lg:grid-cols-[1.5fr_1fr_1fr_1fr_1fr_1fr] lg:grid-rows-1">
        <DelegationCell order="order-3 lg:order-1">
          {durationTillNow(startTimestamp, currentTime)}
        </DelegationCell>

        <DelegationCell order="order-4 lg:order-2 text-right lg:text-left">
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
          />
        </DelegationCell>

        <DelegationCell order="order-6">
          <DelegationActions
            state={state}
            intermediateState={intermediateState}
            isEligibleForTransition={isEligibleForTransition}
            stakingTxHashHex={stakingTxHashHex}
            onTransition={onTransition}
            onUnbond={onUnbond}
            onWithdraw={onWithdraw}
          />
        </DelegationCell>
      </div>
    </div>
  );
};
