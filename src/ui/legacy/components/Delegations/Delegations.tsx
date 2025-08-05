import { getBabylonParamByBtcHeight } from "@babylonlabs-io/btc-staking-ts";
import { Card, Heading, Table } from "@babylonlabs-io/core-ui";
import { useEffect, useMemo, useState } from "react";
import { FaBitcoin } from "react-icons/fa";
import { useLocalStorage } from "usehooks-ts";

import { RegistrationEndModal } from "@/ui/legacy/components/Modals/RegistrationModal/RegistrationEndModal";
import { RegistrationStartModal } from "@/ui/legacy/components/Modals/RegistrationModal/RegistrationStartModal";
import { SignModal } from "@/ui/legacy/components/Modals/SignModal/SignModal";
import { WithdrawModal } from "@/ui/legacy/components/Modals/WithdrawModal";
import { getNetworkConfigBTC } from "@/ui/legacy/config/network/btc";
import { DOCUMENTATION_LINKS, ONE_MINUTE } from "@/ui/legacy/constants";
import { useError } from "@/ui/legacy/context/Error/ErrorProvider";
import { useBTCWallet } from "@/ui/legacy/context/wallet/BTCWalletProvider";
import { ClientError, ERROR_CODES } from "@/ui/legacy/errors";
import { useDelegations } from "@/ui/legacy/hooks/client/api/useDelegations";
import { useNetworkFees } from "@/ui/legacy/hooks/client/api/useNetworkFees";
import { useNetworkInfo } from "@/ui/legacy/hooks/client/api/useNetworkInfo";
import { useRegistrationService } from "@/ui/legacy/hooks/services/useRegistrationService";
import { useV1TransactionService } from "@/ui/legacy/hooks/services/useV1TransactionService";
import { useLogger } from "@/ui/legacy/hooks/useLogger";
import { useDelegationState } from "@/ui/legacy/state/DelegationState";
import { useFinalityProviderState } from "@/ui/legacy/state/FinalityProviderState";
import {
  Delegation as DelegationInterface,
  DelegationState,
} from "@/ui/legacy/types/delegations";
import { FinalityProviderState } from "@/ui/legacy/types/finalityProviders";
import { satoshiToBtc } from "@/ui/legacy/utils/btc";
import { getState, getStateTooltip } from "@/ui/legacy/utils/getState";
import { getIntermediateDelegationsLocalStorageKey } from "@/ui/legacy/utils/local_storage/getIntermediateDelegationsLocalStorageKey";
import { toLocalStorageIntermediateDelegation } from "@/ui/legacy/utils/local_storage/toLocalStorageIntermediateDelegation";
import { maxDecimals } from "@/ui/legacy/utils/maxDecimals";
import { durationTillNow } from "@/ui/legacy/utils/time";
import { trim } from "@/ui/legacy/utils/trim";

import { Hint } from "../Common/Hint";
import { UnbondModal } from "../Modals/UnbondModal";
import { VerificationModal } from "../Modals/VerificationModal";

import { DelegationActions } from "./DelegationActions";

const MODE_WITHDRAW = "withdraw";
const MODE_UNBOND = "unbond";
type MODE = "transition" | "withdraw" | "unbond";
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

const { coinSymbol, mempoolApiUrl } = getNetworkConfigBTC();

// Helper function to compact duration display
function compactDuration(full: string) {
  const parts = full.replace(/ ago$/, "").split(" ");
  const compactParts: string[] = [];
  for (let i = 0; i < parts.length; i += 2) {
    const value = parts[i];
    const unit = parts[i + 1] ?? "";
    const abbr = unit.startsWith("year")
      ? "y"
      : unit.startsWith("month")
        ? "mo"
        : unit.startsWith("week")
          ? "w"
          : unit.startsWith("day")
            ? "d"
            : unit.startsWith("hour")
              ? "h"
              : unit.startsWith("minute")
                ? "m"
                : unit.startsWith("second")
                  ? "s"
                  : unit;
    compactParts.push(`${value}${abbr}`);
  }
  return compactParts.join(" ") + " ago";
}

// Finality Provider Display Component
const FinalityProviderDisplay: React.FC<{
  fpName: string;
  isSlashed: boolean;
  isJailed: boolean;
}> = ({ fpName, isSlashed, isJailed }) => {
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

// Delegation State Component
const DelegationStateDisplay: React.FC<{
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

    if (displayState === DelegationState.OVERFLOW) {
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

// Create column definitions for the Table component (includes Status column for legacy)
const createLegacyDelegationColumns = (
  currentTime: number,
  intermediateDelegationsLocalStorage: DelegationInterface[],
  onRegistration: (delegation: DelegationInterface) => Promise<void>,
  onWithdraw: (id: string) => void,
  onUnbond: (id: string) => void,
  getRegisteredFinalityProvider: any,
  getFinalityProviderName: any,
) => [
  {
    key: "inception",
    header: "Inception",
    render: (_: unknown, row: DelegationInterface & { id: string }) => {
      const { stakingTx } = row;
      const { startTimestamp } = stakingTx;

      return (
        <span>
          {compactDuration(durationTillNow(startTimestamp, currentTime))}
        </span>
      );
    },
  },
  {
    key: "finalityProvider",
    header: "Finality Provider",
    headerClassName: "max-w-[12rem]",
    cellClassName: "max-w-[12rem] truncate",
    render: (_: unknown, row: DelegationInterface & { id: string }) => {
      const { finalityProviderPkHex } = row;
      const finalityProvider = getRegisteredFinalityProvider(
        finalityProviderPkHex,
      );
      const fpState = finalityProvider?.state;
      const fpName = getFinalityProviderName(finalityProviderPkHex) ?? "-";
      const isSlashed = fpState === FinalityProviderState.SLASHED;
      const isJailed = fpState === FinalityProviderState.JAILED;

      return (
        <FinalityProviderDisplay
          fpName={fpName}
          isSlashed={isSlashed}
          isJailed={isJailed}
        />
      );
    },
  },
  {
    key: "amount",
    header: "Amount",
    cellClassName: "min-w-[8rem]",
    render: (_: unknown, row: DelegationInterface & { id: string }) => {
      const { stakingValueSat } = row;
      return (
        <div className="flex gap-1 items-center">
          <FaBitcoin className="text-primary" />
          <p>
            {maxDecimals(satoshiToBtc(stakingValueSat), 8)} {coinSymbol}
          </p>
        </div>
      );
    },
  },
  {
    key: "txHash",
    header: "Transaction ID",
    render: (_: unknown, row: DelegationInterface & { id: string }) => {
      const { stakingTxHashHex } = row;
      return (
        <a
          href={`${mempoolApiUrl}/tx/${stakingTxHashHex}`}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:underline"
        >
          {trim(stakingTxHashHex)}
        </a>
      );
    },
  },
  {
    key: "status",
    header: "Status",
    render: (_: unknown, row: DelegationInterface & { id: string }) => {
      const { state, isOverflow, finalityProviderPkHex } = row;

      const finalityProvider = getRegisteredFinalityProvider(
        finalityProviderPkHex,
      );
      const fpState = finalityProvider?.state;
      const isActive = state === DelegationState.ACTIVE;
      const isFpRegistered = finalityProvider !== null;
      const isSlashed = fpState === FinalityProviderState.SLASHED;

      const intermediateDelegation = intermediateDelegationsLocalStorage.find(
        (item) => item.stakingTxHashHex === row.stakingTxHashHex,
      );

      const displayState =
        isOverflow && isActive
          ? DelegationState.OVERFLOW
          : intermediateDelegation?.state || state;

      return (
        <DelegationStateDisplay
          displayState={displayState}
          isSlashed={isSlashed}
          isFPRegistered={isFpRegistered}
        />
      );
    },
  },
  {
    key: "actions",
    header: "Action",
    frozen: "right" as const,
    render: (_: unknown, row: DelegationInterface & { id: string }) => {
      const {
        state,
        stakingTxHashHex,
        finalityProviderPkHex,
        isEligibleForTransition,
      } = row;

      const intermediateDelegation = intermediateDelegationsLocalStorage.find(
        (item) => item.stakingTxHashHex === stakingTxHashHex,
      );

      const finalityProvider = getRegisteredFinalityProvider(
        finalityProviderPkHex,
      );
      const isFpRegistered = finalityProvider !== null;

      return (
        <DelegationActions
          state={state}
          intermediateState={intermediateDelegation?.state}
          isEligibleForRegistration={isEligibleForTransition}
          isFpRegistered={isFpRegistered}
          stakingTxHashHex={stakingTxHashHex}
          finalityProviderPkHex={finalityProviderPkHex}
          onRegistration={() => onRegistration(row)}
          onUnbond={onUnbond}
          onWithdraw={onWithdraw}
        />
      );
    },
  },
];

export const Delegations = () => {
  const { data: networkInfo } = useNetworkInfo();
  const { publicKeyNoCoord, connected, network } = useBTCWallet();
  const [modalOpen, setModalOpen] = useState(false);
  const [txID, setTxID] = useState("");
  const [modalMode, setModalMode] = useState<MODE>();
  const { handleError } = useError();
  const logger = useLogger();
  const [awaitingWalletResponse, setAwaitingWalletResponse] = useState(false);
  const { data: delegationsAPI } = useDelegations();
  const [currentTime, setCurrentTime] = useState(Date.now());
  const {
    processing,
    registrationStep: step,
    setRegistrationStep: setStep,
    setSelectedDelegation,
    resetRegistration: handleCloseRegistration,
    delegationStepOptions,
  } = useDelegationState();
  const { registerPhase1Delegation } = useRegistrationService();
  const {
    delegations = [],
    fetchMoreDelegations,
    hasMoreDelegations,
    isLoading,
  } = useDelegationState();

  const { setDelegationStepOptions } = useDelegationState();
  const { getRegisteredFinalityProvider, getFinalityProviderName } =
    useFinalityProviderState();

  const { submitWithdrawalTx, submitUnbondingTx } = useV1TransactionService();
  const { data: networkFees } = useNetworkFees();

  const selectedDelegation = delegationsAPI?.delegations.find(
    (delegation) => delegation.stakingTxHashHex === txID,
  );

  const selectedDelegationUnbondingTime = useMemo(() => {
    if (
      !selectedDelegation?.stakingTx.startHeight ||
      !networkInfo?.params.bbnStakingParams.versions
    ) {
      return 0;
    }
    return getBabylonParamByBtcHeight(
      selectedDelegation.stakingTx.startHeight,
      networkInfo.params.bbnStakingParams.versions,
    ).unbondingTime;
  }, [
    selectedDelegation?.stakingTx.startHeight,
    networkInfo?.params.bbnStakingParams.versions,
  ]);

  const selectedDelegationUnbondingFeeSat = useMemo(() => {
    if (
      !selectedDelegation?.stakingTx.startHeight ||
      !networkInfo?.params.bbnStakingParams.versions
    ) {
      return 0;
    }
    return getBabylonParamByBtcHeight(
      selectedDelegation.stakingTx.startHeight,
      networkInfo.params.bbnStakingParams.versions,
    ).unbondingFeeSat;
  }, [
    selectedDelegation?.stakingTx.startHeight,
    networkInfo?.params.bbnStakingParams.versions,
  ]);

  // Local storage state for intermediate delegations (transitioning, withdrawing)
  const intermediateDelegationsLocalStorageKey =
    getIntermediateDelegationsLocalStorageKey(publicKeyNoCoord);

  const [
    intermediateDelegationsLocalStorage,
    setIntermediateDelegationsLocalStorage,
  ] = useLocalStorage<DelegationInterface[]>(
    intermediateDelegationsLocalStorageKey,
    [],
  );

  // Update the local storage with the new intermediate delegation state
  const updateLocalStorage = (
    delegation: DelegationInterface,
    newState: string,
  ) => {
    const newTxId = delegation.stakingTxHashHex;

    setIntermediateDelegationsLocalStorage((delegations) => {
      // Check if an intermediate delegation with the same transaction ID already exists
      const exists = delegations.some(
        (existingDelegation) => existingDelegation.stakingTxHashHex === newTxId,
      );

      // If it doesn't exist, add the new intermediate delegation
      if (!exists) {
        return [
          toLocalStorageIntermediateDelegation(
            newTxId,
            publicKeyNoCoord,
            delegation.finalityProviderPkHex,
            delegation.stakingValueSat,
            delegation.stakingTx.txHex,
            delegation.stakingTx.timelock,
            newState,
          ),
          ...delegations,
        ];
      }

      // If it exists, return the existing delegations unchanged
      return delegations;
    });
  };

  const handleUnbond = async (id: string) => {
    try {
      if (selectedDelegation?.stakingTxHashHex != id) {
        if (selectedDelegation?.stakingTxHashHex) {
          logger.info("Unbond attempt for delegation", {
            delegationId: selectedDelegation.stakingTxHashHex,
          });
        }
        const clientError = new ClientError(
          ERROR_CODES.VALIDATION_ERROR,
          "Wrong delegation selected for unbonding",
        );
        throw clientError;
      }
      // Sign the withdrawal transaction
      const { stakingTx, finalityProviderPkHex, stakingValueSat } =
        selectedDelegation;
      setAwaitingWalletResponse(true);
      await submitUnbondingTx(
        {
          stakingTimelock: stakingTx.timelock,
          finalityProviderPksNoCoordHex: [finalityProviderPkHex],
          stakingAmountSat: stakingValueSat,
        },
        stakingTx.startHeight,
        stakingTx.txHex,
      );
      // Update the local state with the new intermediate delegation
      updateLocalStorage(
        selectedDelegation,
        DelegationState.INTERMEDIATE_UNBONDING,
      );
    } catch (error: any) {
      logger.error(error);
      handleError({
        error,
      });
    } finally {
      handleModalClose();
    }
  };

  // Handles withdrawing requests for delegations that have expired timelocks
  // It constructs a withdrawal transaction, creates a signature for it,
  // and submits it to the Bitcoin network
  const handleWithdraw = async (id: string) => {
    try {
      if (!networkFees) {
        const clientError = new ClientError(
          ERROR_CODES.MISSING_DATA_ERROR,
          "Network fees not found",
        );
        throw clientError;
      }
      // Prevent the modal from closing
      setAwaitingWalletResponse(true);

      if (selectedDelegation?.stakingTxHashHex != id) {
        const clientError = new ClientError(
          ERROR_CODES.VALIDATION_ERROR,
          "Wrong delegation selected for withdrawal",
        );
        throw clientError;
      }
      // Sign the withdrawal transaction for phase-1 delegation
      const { stakingTx, finalityProviderPkHex, stakingValueSat, unbondingTx } =
        selectedDelegation;
      await submitWithdrawalTx(
        {
          stakingTimelock: stakingTx.timelock,
          finalityProviderPksNoCoordHex: [finalityProviderPkHex],
          stakingAmountSat: stakingValueSat,
        },
        stakingTx.startHeight,
        stakingTx.txHex,
        unbondingTx?.txHex,
      );
      // Update the local state with the new intermediate delegation
      updateLocalStorage(
        selectedDelegation,
        DelegationState.INTERMEDIATE_WITHDRAWAL,
      );
    } catch (error: any) {
      logger.error(error);
      handleError({
        error,
        displayOptions: {
          retryAction: () => handleModal(id, MODE_WITHDRAW),
        },
      });
    } finally {
      handleModalClose();
    }
  };

  const handleModal = (txID: string, mode: MODE) => {
    setModalOpen(true);
    setTxID(txID);
    setModalMode(mode);
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setTxID("");
    setModalMode(undefined);
    setAwaitingWalletResponse(false);
    setDelegationStepOptions(undefined);
    setSelectedDelegation(undefined);
    setStep(undefined);
  };

  useEffect(() => {
    if (!delegationsAPI) {
      return;
    }

    setIntermediateDelegationsLocalStorage((intermediateDelegations) => {
      if (!intermediateDelegations) {
        return [];
      }

      return intermediateDelegations.filter((intermediateDelegation) => {
        const matchingDelegation = delegationsAPI.delegations.find(
          (delegation) =>
            delegation?.stakingTxHashHex ===
            intermediateDelegation?.stakingTxHashHex,
        );

        if (!matchingDelegation) {
          return true; // keep intermediate state if no matching state is found in the API
        }

        // conditions based on intermediate states
        if (
          intermediateDelegation.state ===
          DelegationState.INTERMEDIATE_TRANSITIONING
        ) {
          return !(matchingDelegation.state === DelegationState.TRANSITIONED);
        }

        if (
          intermediateDelegation.state ===
          DelegationState.INTERMEDIATE_UNBONDING
        ) {
          return matchingDelegation.state !== DelegationState.UNBONDED;
        }

        if (
          intermediateDelegation.state ===
          DelegationState.INTERMEDIATE_WITHDRAWAL
        ) {
          return matchingDelegation.state !== DelegationState.WITHDRAWN;
        }

        return true;
      });
    });
  }, [delegationsAPI, setIntermediateDelegationsLocalStorage]);

  useEffect(() => {
    if (modalOpen && !selectedDelegation) {
      const clientError = new ClientError(
        ERROR_CODES.MISSING_DATA_ERROR,
        "Delegation not found when modal is open",
      );
      handleError({
        error: clientError,
        displayOptions: {
          noCancel: false,
        },
      });
      setModalOpen(false);
      setTxID("");
      setModalMode(undefined);
    }
  }, [modalOpen, selectedDelegation, handleError]);

  useEffect(() => {
    const timerId = setInterval(() => setCurrentTime(Date.now()), ONE_MINUTE);
    return () => clearInterval(timerId);
  }, []);

  const onRegistration = async (delegation: DelegationInterface) => {
    setSelectedDelegation(delegation);
    setStep("registration-start");
  };

  const handleProceed = async () => {
    await registerPhase1Delegation();
  };

  if (!connected || !delegationsAPI || !network) {
    return null;
  }

  // combine delegations from the API and local storage, prioritizing API data
  const combinedDelegationsData = delegationsAPI
    ? [...delegations, ...delegationsAPI.delegations]
    : // if no API data, fallback to using only local storage delegations
      delegations;

  // Prepare table data with ID field required by core-ui Table
  const tableData = combinedDelegationsData.map((delegation) => ({
    ...delegation,
    id: `${delegation.stakingTxHashHex}-${delegation.stakingTx.startHeight}`,
  }));

  // Create columns with current dependencies
  const columns = createLegacyDelegationColumns(
    currentTime,
    intermediateDelegationsLocalStorage,
    onRegistration,
    (id: string) => handleModal(id, MODE_WITHDRAW),
    (id: string) => handleModal(id, MODE_UNBOND),
    getRegisteredFinalityProvider,
    getFinalityProviderName,
  );

  return (
    <>
      {combinedDelegationsData.length !== 0 && (
        <Card className="mb-6">
          <Heading variant="h6" className="text-accent-primary py-2 mb-6">
            Pending Registration
          </Heading>

          <Table
            wrapperClassName="max-h-[25rem]"
            className="w-full"
            data={tableData}
            columns={columns}
            loading={isLoading}
            hasMore={hasMoreDelegations}
            onLoadMore={fetchMoreDelegations}
          />
        </Card>
      )}
      {modalMode === MODE_WITHDRAW && txID && selectedDelegation && (
        <WithdrawModal
          open={modalOpen}
          onClose={handleModalClose}
          onSubmit={() => {
            handleWithdraw(txID);
          }}
          processing={awaitingWalletResponse}
        />
      )}
      {modalMode === MODE_UNBOND && (
        <UnbondModal
          open={modalOpen}
          onClose={handleModalClose}
          onSubmit={() => {
            handleUnbond(txID);
          }}
          processing={awaitingWalletResponse}
          unbondingFeeSat={selectedDelegationUnbondingFeeSat}
          unbondingTimeInBlocks={selectedDelegationUnbondingTime}
        />
      )}
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
          options={delegationStepOptions}
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
