/**
 * Import polyfill for array.toSorted
 */
import "core-js/features/array/to-sorted";

import { Loader, Table } from "@babylonlabs-io/core-ui";

import warningOctagon from "@/ui/assets/warning-octagon.svg";
import warningTriangle from "@/ui/assets/warning-triangle.svg";
import { finalityProviderColumns } from "@/ui/components/Staking/FinalityProviders/FinalityProviderColumns";
import { StatusView } from "@/ui/components/Staking/FinalityProviders/FinalityProviderTableStatusView";
import { useFinalityProviderBsnState } from "@/ui/state/FinalityProviderBsnState";

interface FinalityProviderTableProps {
  selectedFP: string;
  onSelectRow?: (fpPK: string) => void;
}

export const FinalityProviderTable = ({
  selectedFP,
  onSelectRow,
}: FinalityProviderTableProps) => {
  const {
    isFetchingFinalityProvider,
    finalityProviders,
    finalityProviderHasNextPage,
    finalityProviderHasError,
    finalityProviderFetchNextPage,
    isRowSelectable,
  } = useFinalityProviderBsnState();

  const errorView = (
    <StatusView
      icon={<img src={warningTriangle} alt="Warning" width={88} height={88} />}
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
      icon={<img src={warningOctagon} alt="Warning" width={160} height={160} />}
      title="No Matches Found"
    />
  );

  if (finalityProviderHasError) {
    return errorView;
  }

  if (
    isFetchingFinalityProvider &&
    (!finalityProviders || finalityProviders.length === 0)
  ) {
    return loadingView;
  }

  if (
    !isFetchingFinalityProvider &&
    (!finalityProviders || finalityProviders.length === 0)
  ) {
    return noMatchesView;
  }

  return (
    <Table
      wrapperClassName="max-h-[28.5rem]"
      className="min-w-full"
      data={finalityProviders}
      columns={finalityProviderColumns}
      loading={isFetchingFinalityProvider}
      hasMore={finalityProviderHasNextPage}
      onLoadMore={finalityProviderFetchNextPage}
      selectedRow={selectedFP}
      onRowSelect={(row) => {
        onSelectRow?.(row?.btcPk ?? "");
      }}
      isRowSelectable={isRowSelectable}
    />
  );
};
