import { Button, Popover } from "@babylonlabs-io/bbn-core-ui";
import { useState } from "react";
import { IoMdMore } from "react-icons/io";
import { Tooltip } from "react-tooltip";

import { DelegationState } from "@/app/types/delegations";

interface DelegationActionsProps {
  state: string;
  intermediateState?: string;
  isEligibleForTransition: boolean;
  stakingTxHashHex: string;
  onTransition: () => Promise<void>;
  onUnbond: (id: string) => void;
  onWithdraw: (id: string) => void;
}

export const DelegationActions: React.FC<DelegationActionsProps> = ({
  state,
  intermediateState,
  isEligibleForTransition,
  stakingTxHashHex,
  onTransition,
  onUnbond,
  onWithdraw,
}) => {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

  // Unbonded
  if (state === DelegationState.UNBONDED) {
    return (
      <div className="flex justify-end lg:justify-start">
        <Button
          variant="outlined"
          size="small"
          color="primary"
          onClick={() => onWithdraw(stakingTxHashHex)}
          disabled={
            intermediateState === DelegationState.INTERMEDIATE_WITHDRAWAL
          }
          className="text-sm font-normal"
        >
          Withdraw
        </Button>
      </div>
    );
  }

  // Active, eligible for transition
  if (
    state === DelegationState.ACTIVE ||
    isEligibleForTransition ||
    state === DelegationState.WITHDRAWN
  ) {
    return (
      <div
        className="flex justify-end lg:justify-start"
        data-tooltip-id="tooltip-transition"
        data-tooltip-content={
          state === DelegationState.ACTIVE && !isEligibleForTransition
            ? "Staking transition is not available yet, come back later"
            : ""
        }
      >
        <div className="flex items-center gap-1">
          <Button
            variant="outlined"
            size="small"
            color="primary"
            onClick={onTransition}
            disabled={
              intermediateState ===
                DelegationState.INTERMEDIATE_TRANSITIONING ||
              (state === DelegationState.ACTIVE && !isEligibleForTransition)
            }
            className="text-sm font-normal border-primary-main/20 bg-white"
          >
            Transition
          </Button>
          <Tooltip id="tooltip-transition" className="tooltip-wrap" />
        </div>

        <button
          ref={setAnchorEl}
          onClick={() => setIsPopoverOpen(!isPopoverOpen)}
          className="pl-1 pt-2 pr-0 pb-3 hover:bg-gray-100 rounded"
        >
          <IoMdMore className="h-6 w-6" />
        </button>

        <Popover
          open={isPopoverOpen}
          anchorEl={anchorEl}
          placement="bottom-end"
          onClickOutside={() => setIsPopoverOpen(false)}
        >
          <div className="py-1 px-2">
            <Button
              variant="outlined"
              size="small"
              color="primary"
              onClick={() => {
                onUnbond(stakingTxHashHex);
                setIsPopoverOpen(false);
              }}
              className="text-sm font-normal border-primary-main/20 bg-white w-32"
            >
              Unbond
            </Button>
          </div>
        </Popover>
      </div>
    );
  }

  return null;
};
