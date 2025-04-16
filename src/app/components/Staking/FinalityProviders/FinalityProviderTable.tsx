/**
 * Import polyfill for array.toSorted
 */
import "core-js/features/array/to-sorted";

import { Loader, useWatch } from "@babylonlabs-io/core-ui";
import Image from "next/image";
import { useMemo } from "react";

import warningOctagon from "@/app/assets/warning-octagon.svg";
import warningTriangle from "@/app/assets/warning-triangle.svg";
import { useLanguage } from "@/app/contexts/LanguageContext";
import { useFinalityProviderState } from "@/app/state/FinalityProviderState";
import { translations } from "@/app/translations";
import { FinalityProviderStateLabels } from "@/app/types/finalityProviders";
import { satoshiToBtc } from "@/utils/btc";
import { maxDecimals } from "@/utils/maxDecimals";

import { StatusView } from "./FinalityProviderTableStatusView";

interface FinalityProviderTable {
  onSelectRow?: (fpPK: string) => void;
}

export const FinalityProviderTable = ({
  onSelectRow,
}: FinalityProviderTable) => {
  const { isFetching, finalityProviders, hasError } =
    useFinalityProviderState();
  const { language } = useLanguage();
  const t = translations[language];

  const tableData = useMemo(() => {
    if (!finalityProviders) return [];
    onSelectRow?.(finalityProviders[0].btcPk);
    return finalityProviders.map((fp) => ({
      ...fp,
      id: fp.btcPk,
    }));
  }, [finalityProviders]);

  const selectedFP = useWatch({ name: "finalityProvider", defaultValue: "" });

  const errorView = (
    <StatusView
      icon={
        <Image src={warningTriangle} alt="Warning" width={88} height={88} />
      }
      title="Failed to Load"
      description={
        <>
          The finality provider list failed to load. Please check <br />
          your internet connection or try again later.
        </>
      }
    />
  );

  const loadingView = (
    <StatusView
      icon={<Loader className="text-primary-light" />}
      title="Loading Finality Providers"
    />
  );

  const noMatchesView = (
    <StatusView
      icon={
        <Image src={warningOctagon} alt="Warning" width={160} height={160} />
      }
      title="No Matches Found"
    />
  );

  if (hasError) {
    return errorView;
  }

  if (isFetching && (!finalityProviders || finalityProviders.length === 0)) {
    return loadingView;
  }

  if (!isFetching && (!tableData || tableData.length === 0)) {
    return noMatchesView;
  }

  return (
    <div className="space-y-4">
      {tableData.map((fp) => (
        <div
          key={fp.btcPk}
          className={`p-4 rounded-lg border ${
            selectedFP === fp.btcPk
              ? "border-primary-light bg-primary-light/10"
              : "border-gray-200 hover:border-primary-light"
          } cursor-pointer transition-colors`}
          onClick={() => onSelectRow?.(fp.btcPk)}
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">
                {fp.description.moniker}
              </h3>
              <span className="text-sm text-gray-500">
                {FinalityProviderStateLabels[fp.state]}
              </span>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div>
                <p className="text-sm text-gray-500">{t.finalityProvider}</p>
                <p className="font-medium">{fp.btcPk}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">{t.stakedBalance}</p>
                <p className="font-medium">
                  {maxDecimals(satoshiToBtc(fp.activeTVLSat), 8)} BTC
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">{t.feeRate}</p>
                <p className="font-medium">{fp.commission}%</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">{t.totalDelegations}</p>
                <p className="font-medium">{fp.totalDelegations}</p>
              </div>
            </div>

            <div className="pt-2">
              <p className="text-sm text-gray-500">{t.description}</p>
              <p className="text-sm">{fp.description.details}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  // return (
  //   <Table
  //     wrapperClassName="max-h-[28.5rem]"
  //     className="min-w-full"
  //     data={tableData}
  //     columns={finalityProviderColumns}
  //     loading={isFetching}
  //     hasMore={hasNextPage}
  //     onLoadMore={fetchNextPage}
  //     selectedRow={selectedFP}
  //     onRowSelect={(row) => {
  //       onSelectRow?.(row?.btcPk ?? "");
  //     }}
  //     isRowSelectable={isRowSelectable}
  //   />
  // );
};
