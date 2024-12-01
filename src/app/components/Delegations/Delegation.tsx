import { useEffect, useState } from "react";
import { AiOutlineInfoCircle } from "react-icons/ai";
import { FaBitcoin } from "react-icons/fa";
import { IoIosWarning } from "react-icons/io";
import { Tooltip } from "react-tooltip";

import { useHealthCheck } from "@/app/hooks/useHealthCheck";
import { DelegationState, StakingTx } from "@/app/types/delegations";
import { GlobalParamsVersion } from "@/app/types/globalParams";
import { shouldDisableUnbonding, shouldDisplayPoints } from "@/config";
import { getNetworkConfig } from "@/config/network.config";
import { satoshiToBtc } from "@/utils/btcConversions";
import { durationTillNow } from "@/utils/formatTime";
import { getState, getStateTooltip } from "@/utils/getState";
import { maxDecimals } from "@/utils/maxDecimals";
import { trim } from "@/utils/trim";

import { DelegationPoints } from "../Points/DelegationPoints";

interface DelegationProps {
  stakingTx: StakingTx;
  stakingValueSat: number;
  stakingTxHash: string;
  state: string;
  onUnbond: (id: string) => void;
  onWithdraw: (id: string) => void;
  // This attribute is set when an action has been taken by the user
  // that should change the status but the back-end
  // has not had time to reflect this change yet
  intermediateState?: string;
  isOverflow: boolean;
  globalParamsVersion: GlobalParamsVersion;
}

export const Delegation: React.FC<DelegationProps> = ({
  stakingTx,
  stakingTxHash,
  state,
  stakingValueSat,
  onUnbond,
  onWithdraw,
  intermediateState,
  isOverflow,
  globalParamsVersion,
}) => {
  const { startTimestamp } = stakingTx;
  const [currentTime, setCurrentTime] = useState(Date.now());
  const { isApiNormal, isGeoBlocked } = useHealthCheck();
  const shouldShowPoints =
    isApiNormal && !isGeoBlocked && shouldDisplayPoints();

  useEffect(() => {
    const timerId = setInterval(() => {
      setCurrentTime(Date.now());
    }, 60000); // set the refresh interval to 60 seconds

    return () => clearInterval(timerId);
  }, []);

  const generateActionButton = () => {
    // This function generates the unbond or withdraw button
    // based on the state of the delegation
    // It also disables the button if the delegation
    // is in an intermediate state (local storage)
    if (state === DelegationState.ACTIVE) {
      return (
        <div className="flex justify-end lg:justify-start">
          <div
            data-tooltip-id="tooltip-unbonding"
            data-tooltip-content={
              shouldDisableUnbonding()
                ? "Unbonding temporarily unavailable"
                : ""
            }
            data-tooltip-place="left"
          >
            <button
              className="btn btn-outline btn-xs inline-flex text-sm font-normal text-primary"
              onClick={() => onUnbond(stakingTxHash)}
              disabled={
                intermediateState === DelegationState.INTERMEDIATE_UNBONDING ||
                shouldDisableUnbonding()
              }
            >
              Unbond
            </button>
          </div>
          <Tooltip
            id="tooltip-unbonding"
            className="tooltip-wrap"
            place="left"
            clickable={true}
          />
        </div>
      );
    } else if (state === DelegationState.UNBONDED) {
      return (
        <div className="flex justify-end lg:justify-start">
          <button
            className="btn btn-outline btn-xs inline-flex text-sm font-normal text-primary"
            onClick={() => onWithdraw(stakingTxHash)}
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
      return getStateTooltip(DelegationState.OVERFLOW, globalParamsVersion);
    } else {
      return getStateTooltip(intermediateState || state, globalParamsVersion);
    }
  };

  const { coinName, mempoolApiUrl } = getNetworkConfig();

  return (
    <div
      className={`card relative border bg-base-300 p-4 text-sm dark:bg-base-200 ${isOverflow ? "border-primary" : "dark:border-0"}`}
    >
      {isOverflow && (
        <div className="absolute -top-1 right-1/2 flex translate-x-1/2 items-center gap-1 rounded-md bg-primary px-2 py-1 text-xs text-white lg:right-2 lg:top-1/2 lg:-translate-y-1/2 lg:translate-x-0">
          <IoIosWarning size={16} />
          <p>overflow</p>
        </div>
      )}
      <div
        className={`grid grid-flow-col grid-cols-2 grid-rows-3 items-center gap-2 lg:grid-flow-row ${shouldShowPoints ? "lg:grid-cols-6" : "lg:grid-cols-5"} lg:grid-rows-1`}
      >
        <div className="flex gap-1 items-center order-1">
          <FaBitcoin className="text-primary" />
          <p>
            {maxDecimals(satoshiToBtc(stakingValueSat), 8)} {coinName}
          </p>
        </div>
        <p className="order-3 lg:order-2">
          {durationTillNow(startTimestamp, currentTime)}
        </p>
        <div className="justify-center lg:flex order-2 lg:order-3">
          <a
            href={`${mempoolApiUrl}/tx/${stakingTxHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            {trim(stakingTxHash)}
          </a>
        </div>
        {/*
        we need to center the text without the tooltip
        add its size 12px and gap 4px, 16/2 = 8px
        */}
        <div className="relative flex justify-end lg:justify-center order-4">
          <div className="flex items-center gap-1">
            <p>{renderState()}</p>
            <span
              className="cursor-pointer text-xs"
              data-tooltip-id={`tooltip-${stakingTxHash}`}
              data-tooltip-content={renderStateTooltip()}
              data-tooltip-place="top"
            >
              <AiOutlineInfoCircle />
            </span>
            <Tooltip id={`tooltip-${stakingTxHash}`} className="tooltip-wrap" />
          </div>
        </div>
        <DelegationPoints
          stakingTxHash={stakingTxHash}
          className="relative flex justify-end lg:justify-center order-5"
        />
        <div className="order-6">{generateActionButton()}</div>
      </div>
    </div>
  );
};
