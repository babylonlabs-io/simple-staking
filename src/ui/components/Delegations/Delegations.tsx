import { getBabylonParamByBtcHeight } from "@babylonlabs-io/btc-staking-ts";
import { Card, Heading } from "@babylonlabs-io/core-ui";
import { useEffect, useMemo, useState } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import { useLocalStorage } from "usehooks-ts";

import { LoadingTableList } from "@/ui/components/Loading/Loading";
import { RegistrationEndModal } from "@/ui/components/Modals/RegistrationModal/RegistrationEndModal";
import { RegistrationStartModal } from "@/ui/components/Modals/RegistrationModal/RegistrationStartModal";
import { SignModal } from "@/ui/components/Modals/SignModal/SignModal";
import { WithdrawModal } from "@/ui/components/Modals/WithdrawModal";
import { ONE_MINUTE } from "@/ui/constants";
import { useError } from "@/ui/context/Error/ErrorProvider";
import { useBTCWallet } from "@/ui/context/wallet/BTCWalletProvider";
import { ClientError, ERROR_CODES } from "@/ui/errors";
import { useDelegations } from "@/ui/hooks/client/api/useDelegations";
import { useNetworkFees } from "@/ui/hooks/client/api/useNetworkFees";
import { useNetworkInfo } from "@/ui/hooks/client/api/useNetworkInfo";
import { useRegistrationService } from "@/ui/hooks/services/useRegistrationService";
import { useV1TransactionService } from "@/ui/hooks/services/useV1TransactionService";
import { useLogger } from "@/ui/hooks/useLogger";
import { useDelegationState } from "@/ui/state/DelegationState";
import {
  Delegation as DelegationInterface,
  DelegationState,
} from "@/ui/types/delegations";
import { getIntermediateDelegationsLocalStorageKey } from "@/ui/utils/local_storage/getIntermediateDelegationsLocalStorageKey";
import { toLocalStorageIntermediateDelegation } from "@/ui/utils/local_storage/toLocalStorageIntermediateDelegation";

import { UnbondModal } from "../Modals/UnbondModal";
import { VerificationModal } from "../Modals/VerificationModal";

import { Delegation } from "./Delegation";

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

  return (
    <>
      {combinedDelegationsData.length !== 0 && (
        <Card className="mb-6">
          <Heading variant="h6" className="text-accent-primary py-2 mb-6">
            Pending Registration
          </Heading>

          <InfiniteScroll
            className="no-scrollbar max-h-[25rem] overflow-auto"
            dataLength={combinedDelegationsData.length}
            next={fetchMoreDelegations}
            hasMore={hasMoreDelegations}
            loader={isLoading ? <LoadingTableList /> : null}
          >
            <table className="w-full min-w-[1000px]">
              <thead className="sticky top-0 bg-surface">
                <tr className="text-accent-secondary text-xs">
                  <th className="text-left h-[52px] md:min-w-52 px-4 whitespace-nowrap font-normal">
                    Inception
                  </th>
                  <th className="text-left h-[52px] px-4 whitespace-nowrap font-normal">
                    Finality Provider
                  </th>
                  <th className="text-left h-[52px] px-4 whitespace-nowrap font-normal">
                    Amount
                  </th>
                  <th className="text-left h-[52px] px-4 whitespace-nowrap font-normal">
                    Transaction ID
                  </th>
                  <th className="text-left h-[52px] px-4 whitespace-nowrap font-normal">
                    Status
                  </th>
                  <th className="text-left h-[52px] px-4 whitespace-nowrap font-normal">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody>
                {combinedDelegationsData?.map((delegation) => {
                  if (!delegation) return null;
                  const { stakingTx, stakingTxHashHex } = delegation;
                  const intermediateDelegation =
                    intermediateDelegationsLocalStorage.find(
                      (item) => item.stakingTxHashHex === stakingTxHashHex,
                    );

                  return (
                    <Delegation
                      currentTime={currentTime}
                      key={stakingTxHashHex + stakingTx.startHeight}
                      delegation={delegation}
                      onWithdraw={() =>
                        handleModal(stakingTxHashHex, MODE_WITHDRAW)
                      }
                      onRegistration={onRegistration}
                      onUnbond={() =>
                        handleModal(stakingTxHashHex, MODE_UNBOND)
                      }
                      intermediateState={intermediateDelegation?.state}
                    />
                  );
                })}
              </tbody>
            </table>
          </InfiniteScroll>
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
