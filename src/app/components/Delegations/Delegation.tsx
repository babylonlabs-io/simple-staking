import Image from "next/image";
import { useEffect, useState } from "react";
import { AiOutlineInfoCircle } from "react-icons/ai";
import { Tooltip } from "react-tooltip";

import arrowRight from "@/app/assets/arrow-right.svg";
import { DelegationState, StakingTx } from "@/app/types/delegations";
import { GlobalParamsVersion } from "@/app/types/globalParams";
import { getNetworkConfig } from "@/config/network.config";
import { satoshiToBtc } from "@/utils/btcConversions";
import { timestampFormatted } from "@/utils/formatTime";
import { getState, getStateTooltip } from "@/utils/getState";
import { maxDecimals } from "@/utils/maxDecimals";
import { trim } from "@/utils/trim";

interface DelegationProps {
  finalityProviderMoniker: string;
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
          <button
            className="uppercase text-base inline-flex items-center gap-2 md:hover:opacity-70 md:transition-opacity"
            onClick={() => onUnbond(stakingTxHash)}
            disabled={
              intermediateState === DelegationState.INTERMEDIATE_UNBONDING
            }
          >
            Unbond
            <Image
              src={arrowRight}
              className=""
              style={{ width: "16px" }}
              alt="arrow-right"
            />
          </button>
        </div>
      );
    } else if (state === DelegationState.UNBONDED) {
      return (
        <div className="flex justify-end lg:justify-start">
          <button
            className="uppercase text-base inline-flex items-center gap-2 md:hover:opacity-70 md:transition-opacity"
            onClick={() => onWithdraw(stakingTxHash)}
            disabled={
              intermediateState === DelegationState.INTERMEDIATE_WITHDRAWAL
            }
          >
            Withdraw
            <Image
              src={arrowRight}
              className=""
              style={{ width: "16px" }}
              alt="arrow-right"
            />
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
      className={`relative border border-t-0 px-6 text-base ${isOverflow ? "border-es-border" : "border-es-border"}`}
    >
      <div className="grid grid-flow-col grid-cols-2 grid-rows-2 items-center md:gap-2 lg:grid-flow-row lg:grid-cols-5 lg:grid-rows-1">
        <p className="text-center py-1.5 border-r border-r-es-border">
          {timestampFormatted(startTimestamp)}
        </p>
        <p className="text-center py-1.5 border-r border-r-es-border">
          {maxDecimals(satoshiToBtc(stakingValueSat), 8)}
        </p>
        <div className="hidden justify-center lg:flex py-1.5 border-r border-r-es-border">
          <a
            href={`${mempoolApiUrl}/tx/${stakingTxHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-es-text-hint text-base flex items-center gap-3 hover:underline"
          >
            {trim(stakingTxHash)}
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M6.22222 2.66667V4.44444H1.77778V14.2222H11.5556V9.77778H13.3333V15.1111C13.3333 15.3469 13.2397 15.573 13.073 15.7397C12.9063 15.9064 12.6802 16 12.4444 16H0.888889C0.653141 16 0.427048 15.9064 0.260349 15.7397C0.0936505 15.573 0 15.3469 0 15.1111V3.55556C0 3.31981 0.0936505 3.09372 0.260349 2.92702C0.427048 2.76032 0.653141 2.66667 0.888889 2.66667H6.22222ZM16 0V7.11111H14.2222V3.03378L7.29511 9.96178L6.03822 8.70489L12.9644 1.77778H8.88889V0H16Z"
                fill="#B2B2B2"
              />
            </svg>
          </a>
        </div>
        {/*
        we need to center the text without the tooltip
        add its size 12px and gap 4px, 16/2 = 8px
        */}
        <div className="relative flex justify-end lg:left-[8px] lg:justify-center border-r py-1.5 border-r-es-border">
          <div className="flex items-center gap-1">
            <p>{renderState()}</p>
            <span
              className="cursor-pointer text-xs"
              data-tooltip-id={`tooltip-${stakingTxHash}`}
              data-tooltip-content={renderStateTooltip()}
              data-tooltip-place="top"
            >
              <AiOutlineInfoCircle className="hover:fill-es-accent" />
            </span>
            <Tooltip
              id={`tooltip-${stakingTxHash}`}
              place="top"
              className="tooltip-es"
            />
          </div>
        </div>
        <div className="relative flex justify-end lg:left-[8px] lg:justify-center">
          <div className="flex items-center gap-1">
            <div>{generateActionButton()}</div>
          </div>
        </div>
      </div>
    </div>
  );
};
