import { Button, Popover } from "@babylonlabs-io/bbn-core-ui";
import { useState } from "react";
import { IoMdMore } from "react-icons/io";
import { Tooltip } from "react-tooltip";

import { useFinalityProviderState } from "@/app/state/FinalityProviderState";
import { DelegationState } from "@/app/types/delegations";
import { FinalityProviderState } from "@/app/types/finalityProviders";

interface DelegationActionsProps {
  state: string;
  intermediateState?: string;
  isEligibleForRegistration: boolean;
  stakingTxHashHex: string;
  finalityProviderPkHex: string;
  onRegistration: () => Promise<void>;
  onUnbond: (id: string) => void;
  onWithdraw: (id: string) => void;
}

export const DelegationActions: React.FC<DelegationActionsProps> = ({
  state,
  intermediateState,
  isEligibleForRegistration,
  stakingTxHashHex,
  finalityProviderPkHex,
  onRegistration,
  onUnbond,
  onWithdraw,
}) => {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const { getFinalityProvider } = useFinalityProviderState();

  const finalityProvider = getFinalityProvider(finalityProviderPkHex);
  const fpState = finalityProvider?.state;
  const isSlashed = fpState === FinalityProviderState.SLASHED;

  // We no longer show the registration button when the unbonding transaction is pending
  if (intermediateState === DelegationState.INTERMEDIATE_UNBONDING) {
    return null;
  }

  // Unbonded
  if (
    state === DelegationState.UNBONDED &&
    intermediateState !== DelegationState.INTERMEDIATE_WITHDRAWAL
  ) {
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
        >
          Withdraw
        </Button>
      </div>
    );
  }

  // If FP is slashed, only show unbond button
  if (isSlashed) {
    return (
      <div className="flex justify-end lg:justify-start">
        <Button
          variant="outlined"
          size="small"
          color="primary"
          onClick={() => onUnbond(stakingTxHashHex)}
        >
          Unbond
        </Button>
      </div>
    );
  }

  // Active, eligible for registration
  if (state === DelegationState.ACTIVE || isEligibleForRegistration) {
    return (
      <div
        className="flex justify-end lg:justify-start"
        data-tooltip-id="tooltip-registration"
        data-tooltip-content={
          state === DelegationState.ACTIVE && !isEligibleForRegistration
            ? "Staking registration is not available yet, come back later"
            : ""
        }
      >
        <div className="flex items-center gap-1">
          <Button
            variant="outlined"
            size="small"
            color="primary"
            onClick={onRegistration}
            disabled={
              intermediateState ===
                DelegationState.INTERMEDIATE_TRANSITIONING ||
              (state === DelegationState.ACTIVE && !isEligibleForRegistration)
            }
          >
            Register
          </Button>
          <Tooltip id="tooltip-registration" className="tooltip-wrap" />
        </div>

        <button
          ref={setAnchorEl}
          onClick={() => setIsPopoverOpen(!isPopoverOpen)}
          className="ml-1 py-2 px-0 hover:bg-secondary-highlight rounded"
        >
          <IoMdMore className="h-6 w-6" />
        </button>

        <Popover
          open={isPopoverOpen}
          anchorEl={anchorEl}
          placement="bottom-end"
          onClickOutside={() => setIsPopoverOpen(false)}
        >
          <Button
            className="bg-surface"
            variant="outlined"
            size="small"
            color="primary"
            onClick={() => {
              onUnbond(stakingTxHashHex);
              setIsPopoverOpen(false);
            }}
          >
            Unbond
          </Button>
        </Popover>
      </div>
    );
  }

  return null;
};
