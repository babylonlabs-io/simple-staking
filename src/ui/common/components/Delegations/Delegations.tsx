import { getBabylonParamByBtcHeight } from "@babylonlabs-io/btc-staking-ts";
import type {
  ColumnProps as CoreTableColumn,
  TableData as CoreTableData,
} from "@babylonlabs-io/core-ui";
import { Card, Heading, Table } from "@babylonlabs-io/core-ui";
import { useEffect, useMemo, useState } from "react";
import { FaBitcoin } from "react-icons/fa";
import { Tooltip } from "react-tooltip";
import { useLocalStorage } from "usehooks-ts";

import { Hint } from "@/ui/common/components/Common/Hint";
import { DelegationActions } from "@/ui/common/components/Delegations/components/DelegationActions";
import { RegistrationEndModal } from "@/ui/common/components/Modals/RegistrationModal/RegistrationEndModal";
import { RegistrationStartModal } from "@/ui/common/components/Modals/RegistrationModal/RegistrationStartModal";
import { SignModal } from "@/ui/common/components/Modals/SignModal/SignModal";
import { WithdrawModal } from "@/ui/common/components/Modals/WithdrawModal";
import { getNetworkConfigBTC } from "@/ui/common/config/network/btc";
import { DOCUMENTATION_LINKS, ONE_MINUTE } from "@/ui/common/constants";
import { useError } from "@/ui/common/context/Error/ErrorProvider";
import { useBTCWallet } from "@/ui/common/context/wallet/BTCWalletProvider";
import { ClientError, ERROR_CODES } from "@/ui/common/errors";
import { useDelegations } from "@/ui/common/hooks/client/api/useDelegations";
import { useNetworkFees } from "@/ui/common/hooks/client/api/useNetworkFees";
import { useNetworkInfo } from "@/ui/common/hooks/client/api/useNetworkInfo";
import { useRegistrationService } from "@/ui/common/hooks/services/useRegistrationService";
import { useV1TransactionService } from "@/ui/common/hooks/services/useV1TransactionService";
import { useLogger } from "@/ui/common/hooks/useLogger";
import { useDelegationState } from "@/ui/common/state/DelegationState";
import { useFinalityProviderState } from "@/ui/common/state/FinalityProviderState";
import {
  Delegation as DelegationInterface,
  DelegationState,
} from "@/ui/common/types/delegations";
import { FinalityProviderState } from "@/ui/common/types/finalityProviders";
import { satoshiToBtc } from "@/ui/common/utils/btc";
import { getState, getStateTooltip } from "@/ui/common/utils/getState";
import { getIntermediateDelegationsLocalStorageKey } from "@/ui/common/utils/local_storage/getIntermediateDelegationsLocalStorageKey";
import { toLocalStorageIntermediateDelegation } from "@/ui/common/utils/local_storage/toLocalStorageIntermediateDelegation";
import { maxDecimals } from "@/ui/common/utils/maxDecimals";
import { durationTillNow } from "@/ui/common/utils/time";
import { trim } from "@/ui/common/utils/trim";

import { UnbondModal } from "../Modals/UnbondModal";
import { VerificationModal } from "../Modals/VerificationModal";

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

  const { submitWithdrawalTx, submitUnbondingTx } = useV1TransactionService();
  const { data: networkFees } = useNetworkFees();
  const { coinSymbol, mempoolApiUrl } = getNetworkConfigBTC();
  const { getRegisteredFinalityProvider, getFinalityProviderName } =
    useFinalityProviderState();

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

  type RowData = CoreTableData & {
    delegation: DelegationInterface;
    intermediateState?: string;
  };

  const rows: RowData[] = combinedDelegationsData.map((delegation) => {
    const intermediateDelegation = intermediateDelegationsLocalStorage.find(
      (item) => item.stakingTxHashHex === delegation.stakingTxHashHex,
    );
    return {
      id: `${delegation.stakingTxHashHex}-${delegation.stakingTx.startHeight}`,
      delegation,
      intermediateState: intermediateDelegation?.state,
    };
  });

  const columns: CoreTableColumn<RowData>[] = [
    {
      key: "inception",
      header: "Inception",
      headerClassName:
        "text-left h-[52px] px-2 font-normal text-accent-secondary text-xs",
      cellClassName: "h-16 px-2",
      render: (_, row) => {
        const d = row.delegation;
        const { startTimestamp } = d.stakingTx;
        const finalityProvider = getRegisteredFinalityProvider(
          d.finalityProviderPkHex,
        );
        const isFpRegistered = finalityProvider !== null;
        const fpState = finalityProvider?.state;
        const isSlashed = fpState === FinalityProviderState.SLASHED;
        const displayState =
          d.isOverflow && d.state === DelegationState.ACTIVE
            ? DelegationState.OVERFLOW
            : row.intermediateState || d.state;

        const stateTooltip = () => {
          if (!isFpRegistered) {
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

        return (
          <div className="flex flex-col">
            <span>
              {durationTillNow(startTimestamp, currentTime, { compact: true })}
            </span>
            <Hint
              tooltip={stateTooltip()}
              status={isSlashed ? "warning" : "default"}
            >
              {isSlashed ? (
                <span className="text-error-main text-xs">Slashed</span>
              ) : (
                <span className="text-xs">{getState(displayState)}</span>
              )}
            </Hint>
          </div>
        );
      },
    },
    {
      key: "finalityProvider",
      header: "Finality Provider",
      headerClassName:
        "text-left h-[52px] px-2 font-normal max-w-[12rem] truncate text-accent-secondary text-xs",
      cellClassName: "h-16 px-2 max-w-[12rem] truncate",
      render: (_, row) => {
        const fpName =
          getFinalityProviderName(row.delegation.finalityProviderPkHex) || "-";
        const finalityProvider = getRegisteredFinalityProvider(
          row.delegation.finalityProviderPkHex,
        );
        const fpState = finalityProvider?.state;
        const isSlashed = fpState === FinalityProviderState.SLASHED;
        const isJailed = fpState === FinalityProviderState.JAILED;

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
      },
    },
    {
      key: "amount",
      header: "Amount",
      headerClassName:
        "text-left h-[52px] px-2 font-normal min-w-[8rem] text-accent-secondary text-xs",
      cellClassName: "h-16 px-2 min-w-[8rem]",
      render: (_, row) => (
        <div className="flex gap-1 items-center">
          <FaBitcoin className="text-primary" />
          <p>
            {maxDecimals(satoshiToBtc(row.delegation.stakingValueSat), 8)}{" "}
            {coinSymbol}
          </p>
        </div>
      ),
    },
    {
      key: "txid",
      header: "Transaction ID",
      headerClassName:
        "text-left h-[52px] px-2 font-normal text-accent-secondary text-xs",
      cellClassName: "h-16 px-2",
      render: (_, row) => (
        <a
          href={`${mempoolApiUrl}/tx/${row.delegation.stakingTxHashHex}`}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:underline"
        >
          {trim(row.delegation.stakingTxHashHex)}
        </a>
      ),
    },
    {
      key: "action",
      header: "Action",
      headerClassName:
        "text-left h-[52px] px-1 font-normal text-accent-secondary text-xs w-[6.5rem] sm:w-[9rem]",
      cellClassName: "h-16 px-1 w-[6.5rem] sm:w-[9rem]",
      frozen: "right",
      render: (_, row) => (
        <DelegationActions
          state={row.delegation.state}
          intermediateState={row.intermediateState}
          isEligibleForRegistration={row.delegation.isEligibleForTransition}
          isFpRegistered={
            getRegisteredFinalityProvider(
              row.delegation.finalityProviderPkHex,
            ) !== null
          }
          stakingTxHashHex={row.delegation.stakingTxHashHex}
          finalityProviderPkHex={row.delegation.finalityProviderPkHex}
          onRegistration={() => onRegistration(row.delegation)}
          onUnbond={(id) => handleModal(id, MODE_UNBOND)}
          onWithdraw={(id) => handleModal(id, MODE_WITHDRAW)}
        />
      ),
    },
  ];

  return (
    <>
      <Tooltip
        anchorSelect="[data-tooltip-id^='tooltip-registration-']"
        className="tooltip-wrap"
        clickable={true}
        delayHide={500}
        positionStrategy="fixed"
        globalCloseEvents={{ scroll: true }}
      />
      {rows.length !== 0 && (
        <Card className="mb-6">
          <Heading variant="h6" className="text-accent-primary py-2 mb-6">
            Pending Registration
          </Heading>
          <Table
            data={rows}
            columns={columns}
            wrapperClassName="no-scrollbar max-h-[25rem] overflow-y-auto overflow-x-auto"
            className="w-full min-w-[1000px]"
            hasMore={hasMoreDelegations}
            loading={isLoading}
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
