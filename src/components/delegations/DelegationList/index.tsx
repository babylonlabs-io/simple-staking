import { useTransactionService } from "@/app/hooks/services/useTransactionService";
import { useDelegationV2State } from "@/app/state/DelegationV2State";
import type {
  DelegationV2,
  DelegationV2Params,
} from "@/app/types/delegationsV2";
import { useCurrentTime } from "@/hooks/useCurrentTime";

import { type TableColumn, GridTable } from "../../common/GridTable";

import { ActionButton } from "./components/ActionButton";
import { Amount } from "./components/Amount";
import { Status } from "./components/Status";
import { TxHash } from "./components/TxHash";

const columns = (
  handleActionClick: (action: string, txHash: string) => void,
): TableColumn<DelegationV2, DelegationV2Params>[] => [
  {
    field: "stakingAmount",
    headerName: "Amount",
    width: "max-content",
    renderCell: (row) => <Amount value={row.stakingAmount} />,
  },
  {
    field: "startHeight",
    headerName: "Duration",
    width: "max-content",
    align: "center",
  },
  {
    field: "stakingTxHashHex",
    headerName: "Transaction hash",
    cellClassName: "justify-center",
    align: "center",
    renderCell: (row) => <TxHash value={row.stakingTxHashHex} />,
  },
  {
    field: "state",
    headerName: "Status",
    cellClassName: "justify-center",
    align: "center",
    renderCell: (row) => <Status value={row.state} />,
  },
  {
    field: "actions",
    headerName: "Action",
    cellClassName: "justify-center",
    align: "center",
    renderCell: (row) => (
      <ActionButton
        txHash={row.stakingTxHashHex}
        state={row.state}
        onClick={(action, txHash) => handleActionClick(action, txHash)}
      />
    ),
  },
];

export function DelegationList() {
  const currentTime = useCurrentTime();
  const {
    delegations = [],
    fetchMoreDelegations,
    hasMoreDelegations,
    isLoading,
    findDelegationByTxHash,
  } = useDelegationV2State();
  const { submitStakingTx, submitUnbondingTx, submitWithdrawalTx } =
    useTransactionService();

  // Define the onClick function here
  const handleActionClick = async (action: string, txHash: string) => {
    const d = findDelegationByTxHash(txHash);
    if (!d) {
      throw new Error("Delegation not found: " + txHash);
    }
    const {
      stakingTxHashHex,
      finalityProviderBtcPksHex,
      stakingAmount,
      paramsVersion,
      stakingTime,
      unbondingTx,
    } = d;

    if (action === "stake") {
      await submitStakingTx(
        {
          finalityProviderPkNoCoordHex: finalityProviderBtcPksHex[0],
          stakingAmountSat: stakingAmount,
          stakingTimeBlocks: stakingTime,
        },
        paramsVersion,
        stakingTxHashHex,
      );
      // TODO: Transition the delegation to the next immediate state - PENDING CONFIRMATION
    } else if (action === "unbound") {
      await submitUnbondingTx(
        {
          finalityProviderPkNoCoordHex: finalityProviderBtcPksHex[0],
          stakingAmountSat: stakingAmount,
          stakingTimeBlocks: stakingTime,
        },
        paramsVersion,
        stakingTxHashHex,
      );
      // TODO: Transition the delegation to the next immediate state - INTERMEDIATE_UNBONDING
    } else if (action === "withdraw") {
      await submitWithdrawalTx(
        {
          finalityProviderPkNoCoordHex: finalityProviderBtcPksHex[0],
          stakingAmountSat: stakingAmount,
          stakingTimeBlocks: stakingTime,
        },
        paramsVersion,
        stakingTxHashHex,
        unbondingTx,
      );
      // TODO: Transition the delegation to the next immediate state - INTERMEDIATE_WITHDRAWAL
    }
  };

  return (
    <GridTable
      getRowId={(row) => `${row.stakingTxHashHex}-${row.startHeight}`}
      columns={columns(handleActionClick)}
      data={delegations}
      loading={isLoading}
      infiniteScroll={hasMoreDelegations}
      onInfiniteScroll={fetchMoreDelegations}
      classNames={{
        headerCellClassName: "py-2 px-4 bg-base-300",
        wrapperClassName: "max-h-[21rem] overflow-x-auto",
        bodyClassName: "gap-y-4 min-w-[1000px]",
        cellClassName:
          "p-4 first:pl-4 first:rounded-l-2xl last:pr-4 last:rounded-r-2xl bg-base-300 border dark:bg-base-200 dark:border-0 flex items-center text-sm",
      }}
      params={{ currentTime }}
      fallback={<div>No delegations found</div>}
    />
  );
}
