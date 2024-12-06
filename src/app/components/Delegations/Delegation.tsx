import { useEffect, useState } from "react";
import { AiOutlineInfoCircle } from "react-icons/ai";
import { FaBitcoin } from "react-icons/fa";
import { IoIosWarning } from "react-icons/io";
import { Tooltip } from "react-tooltip";

import { useFinalityProviderService } from "@/app/hooks/services/useFinalityProviderService";
import {
  type SigningStep,
  useTransactionService,
} from "@/app/hooks/services/useTransactionService";
import { useHealthCheck } from "@/app/hooks/useHealthCheck";
import {
  type Delegation as DelegationInterface,
  DelegationState,
} from "@/app/types/delegations";
import { getNetworkConfig } from "@/config/network.config";
import { satoshiToBtc } from "@/utils/btc";
import { getState, getStateTooltip } from "@/utils/getState";
import { maxDecimals } from "@/utils/maxDecimals";
import { durationTillNow } from "@/utils/time";
import { trim } from "@/utils/trim";

interface DelegationProps {
  delegation: DelegationInterface;
  onWithdraw: (id: string) => void;
  // This attribute is set when an action has been taken by the user
  // that should change the status but the back-end
  // has not had time to reflect this change yet
  intermediateState?: string;
}

export const Delegation: React.FC<DelegationProps> = ({
  delegation,
  onWithdraw,
  intermediateState,
}) => {
  const {
    stakingTx,
    stakingTxHashHex,
    state,
    stakingValueSat,
    isOverflow,
    finalityProviderPkHex,
  } = delegation;

  const { startTimestamp } = stakingTx;
  const [currentTime, setCurrentTime] = useState(Date.now());
  const { isApiNormal, isGeoBlocked } = useHealthCheck();
  const { transitionPhase1Delegation } = useTransactionService();
  const { getFinalityProviderMoniker } = useFinalityProviderService(); // get the moniker of the finality provider
  useEffect(() => {
    const timerId = setInterval(() => {
      setCurrentTime(Date.now());
    }, 60000); // set the refresh interval to 60 seconds

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
      {
        finalityProviderPkNoCoordHex: finalityProviderPkHex,
        stakingAmountSat: stakingValueSat,
        stakingTimelock: stakingTx.timelock,
      },
      transitionCallback,
    );
    // TODO: Close the transaction signing modal and update the UI
  };

  const generateActionButton = () => {
    if (
      state === DelegationState.ACTIVE ||
      delegation.isEligibleForTransition
    ) {
      return (
        <div
          className="flex justify-end lg:justify-start"
          data-tooltip-id="tooltip-transition"
          data-tooltip-content={
            state === DelegationState.ACTIVE &&
            !delegation.isEligibleForTransition
              ? "Staking transition is not available yet, come back later"
              : ""
          }
        >
          <button
            className="btn btn-outline btn-xs inline-flex text-sm font-normal text-primary-dark"
            onClick={onTransition}
            disabled={
              intermediateState ===
                DelegationState.INTERMEDIATE_TRANSITIONING ||
              (state === DelegationState.ACTIVE &&
                !delegation.isEligibleForTransition)
            }
          >
            Transition
          </button>
          <Tooltip id="tooltip-transition" className="tooltip-wrap" />
        </div>
      );
    } else if (state === DelegationState.UNBONDED) {
      return (
        <div className="flex justify-end lg:justify-start">
          <button
            className="btn btn-outline btn-xs inline-flex text-sm font-normal text-primary-dark"
            onClick={() => onWithdraw(stakingTxHashHex)}
            disabled={
              intermediateState === DelegationState.INTERMEDIATE_WITHDRAWAL
            }
          >
            Withdraw
          </button>
        </div>
      );
    } else {
      return null;
    }
  };

  const isActive =
    intermediateState === DelegationState.ACTIVE ||
    state === DelegationState.ACTIVE;

  const renderState = () => {
    // overflow should be shown only on active state
    if (isOverflow && isActive) {
      return getState(DelegationState.OVERFLOW);
    } else {
      return getState(intermediateState || state);
    }
  };

  const renderStateTooltip = () => {
    // overflow should be shown only on active state
    if (isOverflow && isActive) {
      return getStateTooltip(DelegationState.OVERFLOW);
    } else {
      return getStateTooltip(intermediateState || state);
    }
  };

  const { coinName, mempoolApiUrl } = getNetworkConfig();

  const renderActionRequired = () => {
    return <p className="text-error-main text-sm">Action Required</p>;
  };

  return (
    <div
      className={`relative rounded bg-secondary-contrast odd:bg-[#F9F9F9] p-4 text-sm text-primary-dark`}
    >
      {isOverflow && (
        <div className="absolute -top-1 right-1/2 flex translate-x-1/2 items-center gap-1 rounded-md bg-primary px-2 py-1 text-xs text-white lg:right-2 lg:top-1/2 lg:-translate-y-1/2 lg:translate-x-0">
          <IoIosWarning size={14} />
          <p>overflow</p>
        </div>
      )}
      <div
        className={`grid grid-flow-col grid-cols-2 grid-rows-3 items-center gap-2 lg:grid-flow-row lg:grid-cols-[1.5fr_1fr_1fr_1fr_1fr_1fr] lg:grid-rows-1`}
      >
        <div className="order-3 lg:order-1">
          {durationTillNow(startTimestamp, currentTime)}
        </div>
        <div className="order-4 lg:order-2 text-right lg:text-left">
          {getFinalityProviderMoniker(finalityProviderPkHex)}
        </div>
        <div className="flex gap-1 items-center order-1 lg:order-3">
          <FaBitcoin className="text-primary" />
          <p>
            {maxDecimals(satoshiToBtc(stakingValueSat), 8)} {coinName}
          </p>
        </div>
        <div className="justify-start lg:flex order-2 lg:order-4">
          <a
            href={`${mempoolApiUrl}/tx/${stakingTxHashHex}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline"
          >
            {trim(stakingTxHashHex)}
          </a>
        </div>
        {/*
        we need to center the text without the tooltip
        add its size 12px and gap 4px, 16/2 = 8px
        */}
        <div className="relative flex justify-end lg:justify-start order-5">
          <div className="flex items-center justify-start gap-1">
            <p>{renderState()}</p>
            <span
              className="cursor-pointer text-xs"
              data-tooltip-id={`tooltip-${stakingTxHashHex}`}
              data-tooltip-content={renderStateTooltip()}
              data-tooltip-place="top"
            >
              <AiOutlineInfoCircle />
            </span>
            <Tooltip
              id={`tooltip-${stakingTxHashHex}`}
              className="tooltip-wrap"
            />
          </div>
        </div>
        <div className="order-6">{generateActionButton()}</div>
      </div>
    </div>
  );
};
