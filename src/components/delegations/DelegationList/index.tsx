import { Heading } from "@babylonlabs-io/bbn-core-ui";

import { useTransactionService } from "@/app/hooks/services/useTransactionService";
import { useDelegationV2State } from "@/app/state/DelegationV2State";
import {
  DelegationV2StakingState,
  type DelegationV2,
} from "@/app/types/delegationsV2";
import { FinalityProviderMoniker } from "@/components/delegations/DelegationList/components/FinalityProviderMoniker";

import { GridTable, type TableColumn } from "../../common/GridTable";

import { ActionButton } from "./components/ActionButton";
import { Amount } from "./components/Amount";
import { Inscription } from "./components/Inscription";
import { Status } from "./components/Status";
import { TxHash } from "./components/TxHash";

const columns: TableColumn<
  DelegationV2,
  { handleActionClick: (action: string, txHash: string) => void }
>[] = [
  {
    field: "inscription",
    headerName: "Inscription",
    width: "max-content",
    renderCell: (row) => (
      <Inscription value={row.bbnInceptionHeight.toString()} />
    ),
  },
  {
    field: "finalityProvider",
    headerName: "Finality Provider",
    width: "max-content",
    renderCell: (row) => (
      <FinalityProviderMoniker value={row.finalityProviderBtcPksHex[0]} />
    ),
  },
  {
    field: "stakingAmount",
    headerName: "Amount",
    width: "max-content",
    renderCell: (row) => <Amount value={row.stakingAmount} />,
  },
  {
    field: "stakingTxHashHex",
    headerName: "Transaction hash",
    renderCell: (row) => <TxHash value={row.stakingTxHashHex} />,
  },
  {
    field: "state",
    headerName: "Status",
    renderCell: (row) => <Status value={row.state} />,
  },
  {
    field: "actions",
    headerName: "Action",
    renderCell: (row, _, { handleActionClick }) => (
      <ActionButton
        txHash={row.stakingTxHashHex}
        state={row.state}
        onClick={(action, txHash) => handleActionClick(action, txHash)}
      />
    ),
  },
];

export function DelegationList() {
  const {
    delegations = [],
    fetchMoreDelegations,
    hasMoreDelegations,
    isLoading,
    findDelegationByTxHash,
  } = useDelegationV2State();
  const {
    submitStakingTx,
    submitUnbondingTx,
    submitEarlyUnbondedWithdrawalTx,
    submitTimelockUnbondedWithdrawalTx,
  } = useTransactionService();

  // Define the onClick function here
  const handleActionClick = async (action: string, txHash: string) => {
    const d = findDelegationByTxHash(txHash);
    if (!d) {
      throw new Error("Delegation not found: " + txHash);
    }
    const {
      stakingTxHashHex,
      stakingTxHex,
      finalityProviderBtcPksHex,
      stakingAmount,
      paramsVersion,
      stakingTime,
      unbondingTxHex,
      covenantUnbondingSignatures,
      state,
      slashingTxHex,
      unbondingSlashingTxHex,
    } = d;

    const finalityProviderPk = finalityProviderBtcPksHex[0];
    const stakingInput = {
      finalityProviderPkNoCoordHex: finalityProviderPk,
      stakingAmountSat: stakingAmount,
      stakingTimeBlocks: stakingTime,
    };

    if (action === "stake") {
      await submitStakingTx(
        stakingInput,
        paramsVersion,
        stakingTxHashHex,
        stakingTxHex,
      );
    } else if (action === "unbound") {
      if (!covenantUnbondingSignatures) {
        throw new Error("Covenant unbonding signatures not found");
      }
      await submitUnbondingTx(
        stakingInput,
        paramsVersion,
        stakingTxHex,
        unbondingTxHex,
        covenantUnbondingSignatures.map((sig) => ({
          btcPkHex: sig.covenantBtcPkHex,
          sigHex: sig.signatureHex,
        })),
      );
      // TODO: Transition the delegation to the next immediate state - INTERMEDIATE_UNBONDING
    } else if (action === "withdraw") {
      if (state === DelegationV2StakingState.EARLY_UNBONDING_WITHDRAWABLE) {
        await submitEarlyUnbondedWithdrawalTx(
          stakingInput,
          paramsVersion,
          unbondingTxHex,
        );
      } else if (state === DelegationV2StakingState.TIMELOCK_WITHDRAWABLE) {
        await submitTimelockUnbondedWithdrawalTx(
          stakingInput,
          paramsVersion,
          stakingTxHex,
        );
      } else if (
        state === DelegationV2StakingState.EARLY_UNBONDING_SLASHING_WITHDRAWABLE
      ) {
        if (!unbondingSlashingTxHex) {
          throw new Error(
            "Unbonding slashing tx not found, can't submit withdrawal",
          );
        }
        await submitEarlyUnbondedWithdrawalTx(
          stakingInput,
          paramsVersion,
          unbondingSlashingTxHex,
        );
      } else if (
        state === DelegationV2StakingState.TIMELOCK_SLASHING_WITHDRAWABLE
      ) {
        if (!slashingTxHex) {
          throw new Error("Slashing tx not found, can't submit withdrawal");
        }
        await submitEarlyUnbondedWithdrawalTx(
          stakingInput,
          paramsVersion,
          slashingTxHex,
        );
      }
      // TODO: Transition the delegation to the next immediate state - INTERMEDIATE_WITHDRAWAL
    }
  };

  return (
    <div className="bg-secondary-contrast p-6">
      <Heading variant="h6" className="text-primary-light py-2 mb-6">
        Babylon Chain Stakes (Phase 2)
      </Heading>
      <GridTable
        getRowId={(row) => `${row.stakingTxHashHex}-${row.startHeight}`}
        columns={columns}
        data={delegations}
        loading={isLoading}
        infiniteScroll={hasMoreDelegations}
        onInfiniteScroll={fetchMoreDelegations}
        classNames={{
          headerRowClassName: "text-primary-light text-xs",
          headerCellClassName: "p-4 text-align-left",
          rowClassName: "group",
          wrapperClassName: "max-h-[21rem] overflow-x-auto",
          bodyClassName: "gap-y-4 min-w-[1000px]",
          cellClassName:
            "p-4 first:pl-4 first:rounded-l last:pr-4 last:rounded-r bg-secondary-contrast flex items-center text-sm justify-start group-even:bg-[#F9F9F9] text-primary-dark",
        }}
        params={{ handleActionClick }}
        fallback={<div>No delegations found</div>}
      />
    </div>
  );
}
