import { Button, Heading } from "@babylonlabs-io/core-ui";
import Image from "next/image";
import React from "react";

import { useLanguage } from "@/app/contexts/LanguageContext";
import { useXrp } from "@/app/contexts/XrpProvider";
import { translations } from "@/app/translations";
import { GridTable, type TableColumn } from "@/components/common/GridTable";
import { Inception } from "@/components/delegations/DelegationList/components/Inception";
import { TxHash } from "@/components/delegations/DelegationList/components/TxHash";
import { executeXrplUnstaking } from "@/utils/xrplUtils";

export const XRPActivityTabs: React.FC = () => {
  const { language } = useLanguage();
  const t = translations[language];

  return (
    <div className="flex-1 min-w-0">
      <div
        className="flex gap-4 items-end"
        style={{
          paddingBottom: "0.5rem",
          borderBottom: "1px solid",
          borderImage:
            "linear-gradient(90deg, #4F4633 -16.24%, #887957 34%, #060504 97.34%) 1",
        }}
      >
        <span
          className={`font-medium relative text-3xl text-accent-primaryborder-b-2 border-primary-main`}
        >
          {t.activity}
        </span>
        <span className="text-sm text-gray-500 ml-2">xrp Stakes</span>
      </div>
      <div className="mt-4">
        <XRPDelegations />
      </div>
    </div>
  );
};

type TableParams = {
  validations: Record<string, { valid: boolean; error?: string }>;
  // handleActionClick: (action: ActionType, delegation: TransactionHistory) => void;
};

export type TransactionHistory = {
  amount: string;
  txHash: string;
  timeStamp: string;
};

const XRPDelegations = () => {
  const { language } = useLanguage();
  const t = translations[language].delegationList;
  const { historyList } = useXrp();
  const { xrpPublicClient, getMnemonic, setHistoryList } = useXrp();

  const columns: TableColumn<TransactionHistory, TableParams>[] = [
    {
      field: "Inception",
      headerName: t.inception,
      width: "minmax(max-content, 1fr)",
      renderCell: (row) => <Inception value={row.timeStamp} />,
    },
    {
      field: "stakingAmount",
      headerName: t.amount,
      width: "minmax(max-content, 1fr)",
      renderCell: (row) => (
        <div className="inline-flex gap-1 items-center order-1 whitespace-nowrap">
          <Image src="/xrp.png" alt="xrp" width={20} height={20} />
          <p>{Number(row.amount)} xrp</p>
        </div>
      ),
    },
    {
      field: "stakingTxHashHex",
      headerName: t.transactionId,
      width: "minmax(max-content, 1fr)",
      renderCell: (row) => <TxHash value={row.txHash} />,
    },
    // {
    //   field: "state",
    //   headerName: t.status,
    //   width: "minmax(max-content, 1fr)",
    //   renderCell: (row, _, { validations }) => {
    //     const { valid, error } = validations[row.stakingTxHashHex];
    //     if (!valid) return <Hint tooltip={error}>{t.unavailable}</Hint>;

    //     return <Status delegation={row} />;
    //   },
    // },
    {
      field: "actions",
      headerName: t.action,
      width: "minmax(max-content, 0.5fr)",
      renderCell: (row, _) => {
        // const { valid, error } = validations[row.txHash];

        // Hide the action button if the delegation is invalid
        // if (!valid) return null;

        return (
          <Button
            variant="outlined"
            size="small"
            onClick={async () => {
              const mnemonic = await getMnemonic();
              if (!mnemonic) {
                console.error("Mnemonic not found");
                return;
              }
              await executeXrplUnstaking(
                row.amount,
                xrpPublicClient!,
                mnemonic,
              );
              setHistoryList((prev) =>
                prev.filter((history) => history.txHash !== row.txHash),
              );
            }}
          >
            {"Unstake"}
          </Button>
        );
      },
    },
  ];

  return (
    <div>
      {/* <Heading variant="h6" className="text-accent-primary py-2 mb-6">
        {networkConfig.bbn.networkFullName} Stakes
      </Heading> */}

      <GridTable
        getRowId={(row) => `${row.timeStamp}-${row.amount}`}
        columns={columns}
        data={historyList}
        // loading={isLoading}
        // isFetchingNextPage={isFetchingNextPage}
        // infiniteScroll={hasMoreDelegations}
        // onInfiniteScroll={fetchMoreDelegations}
        classNames={{
          headerRowClassName: "text-accent-primary text-xs",
          headerCellClassName: "p-4 text-align-left text-accent-secondary",
          rowClassName: "group",
          wrapperClassName: "max-h-[25rem] overflow-x-auto",
          bodyClassName: "min-w-[1000px]",
          cellClassName:
            "p-4 first:pl-4 first:rounded-l last:pr-4 last:rounded-r flex items-center text-sm justify-start text-accent-primary",
        }}
        // params={{
        //   handleActionClick: openConfirmationModal,
        //   validations,
        // }}
        fallback={<NoDelegations />}
      />

      {/* <DelegationModal
        action={confirmationModal?.action}
        delegation={confirmationModal?.delegation ?? null}
        param={confirmationModal?.param ?? null}
        processing={processing}
        onSubmit={executeDelegationAction}
        onClose={closeConfirmationModal}
        networkConfig={networkConfig}
      /> */}
    </div>
  );
};

const NoDelegations = () => {
  const { language } = useLanguage();
  const t = translations[language].noDelegations;

  return (
    <div className="flex flex-col pb-16 pt-10 text-accent-primary gap-4 text-center items-center justify-center">
      {/* <div className="bg-primary-contrast h-20 w-20 flex items-center justify-center">
        <IoEye className="text-5xl text-primary-light" />
      </div> */}
      <Heading variant="h4">{t.title.replace("{networkName}", "xrp")}</Heading>
      <p className="text-base">{t.description}</p>
    </div>
  );
};
