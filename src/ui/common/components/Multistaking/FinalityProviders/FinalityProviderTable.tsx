/**
 * Import polyfill for array.toSorted
 */
import "core-js/features/array/to-sorted";

import { Loader, Table } from "@babylonlabs-io/core-ui";

import warningOctagon from "@/ui/common/assets/warning-octagon.svg";
import warningTriangle from "@/ui/common/assets/warning-triangle.svg";
import { finalityProviderColumns } from "@/ui/common/components/Staking/FinalityProviders/FinalityProviderColumns";
import { StatusView } from "@/ui/common/components/Staking/FinalityProviders/FinalityProviderTableStatusView";
import { useFinalityProviderBsnState } from "@/ui/common/state/FinalityProviderBsnState";

interface FinalityProviderTableProps {
  selectedFP: string;
  onSelectRow?: (fpPK: string) => void;
}

export const FinalityProviderTable = ({
  selectedFP,
  onSelectRow,
}: FinalityProviderTableProps) => {
  const {
    isFetching,
    finalityProviders,
    hasNextPage,
    hasError,
    fetchNextPage,
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

  if (hasError) {
    return errorView;
  }

  if (isFetching && (!finalityProviders || finalityProviders.length === 0)) {
    return loadingView;
  }

  if (!isFetching && (!finalityProviders || finalityProviders.length === 0)) {
    return noMatchesView;
  }

  return (
    <Table
      wrapperClassName="h-[21rem]"
      className="min-w-full"
      data={finalityProviders}
      columns={finalityProviderColumns}
      loading={isFetching}
      hasMore={hasNextPage}
      onLoadMore={fetchNextPage}
      selectedRow={selectedFP}
      onRowSelect={(row) => {
        onSelectRow?.(row?.btcPk ?? "");
      }}
      isRowSelectable={isRowSelectable}
    />
  );
};
