import { Button, Popover } from "@babylonlabs-io/bbn-core-ui";
import { useState } from "react";
import { IoMdMore } from "react-icons/io";
import { Tooltip } from "react-tooltip";

import { useBbnQuery } from "@/app/hooks/client/rpc/queries/useBbnQuery";
import { useFinalityProviderState } from "@/app/state/FinalityProviderState";
import { DelegationState } from "@/app/types/delegations";
import { FinalityProviderState } from "@/app/types/finalityProviders";
import { getNetworkConfigBBN } from "@/config/network/bbn";

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

  const {
    balanceQuery: { data: bbnBalance = 0 },
  } = useBbnQuery();

  const { networkFullName, coinSymbol } = getNetworkConfigBBN();

  const finalityProvider = getFinalityProvider(finalityProviderPkHex);
  const fpState = finalityProvider?.state;
  const isSlashed = fpState === FinalityProviderState.SLASHED;

  const hasInsufficientBalance = bbnBalance === 0;
  const insufficientBalanceMessage = hasInsufficientBalance
    ? `Insufficient ${coinSymbol} Balance in ${networkFullName} Wallet`
    : "";

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
          className="text-sm font-normal"
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
          className="text-sm font-normal border-primary-main/20 bg-white"
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
            : insufficientBalanceMessage
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
              (state === DelegationState.ACTIVE &&
                !isEligibleForRegistration) ||
              hasInsufficientBalance
            }
            className="text-sm font-normal border-primary-main/20 bg-white"
          >
            Register
          </Button>
          <Tooltip id="tooltip-registration" className="tooltip-wrap" />
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
