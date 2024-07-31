import { useWindowSize } from "@uidotdev/usehooks";
import { useEffect } from "react";
import { BsSortDown } from "react-icons/bs";
import { MdKeyboardArrowDown, MdKeyboardArrowUp } from "react-icons/md";
import InfiniteScroll from "react-infinite-scroll-component";

import {
  LoadingTableList,
  LoadingView,
} from "@/app/components/Loading/Loading";
import { useFinalityProvidersData } from "@/app/hooks/finalityProviders/useFinalityProvidersData";
import { useFinalityProvidersSort } from "@/app/hooks/finalityProviders/useFinalityProvidersSort";
import { useMobileSortModal } from "@/app/hooks/finalityProviders/useMobileSortModal";
import {
  FinalityProvidersProps,
  FinalityProvidersSortButtonProps,
  SortField,
} from "@/app/types/finalityProviders";
import { getNetworkConfig } from "@/config/network.config";
import { Network } from "@/utils/wallet/wallet_provider";

import { FinalityProviderMobileSortModal } from "../../Modals/FinalityProviderMobileSortModal";

import { FinalityProvider } from "./FinalityProvider";
import { FinalityProviderSearch } from "./FinalityProviderSearch";

export const FinalityProviders: React.FC<FinalityProvidersProps> = ({
  finalityProviders,
  selectedFinalityProvider,
  onFinalityProviderChange,
  queryMeta,
}) => {
  const { width } = useWindowSize();
  const isMobile = typeof width === "number" ? width < 1000 : false;

  const { handleSearch, sortedProviders, setSortField, setSortDirection } =
    useFinalityProvidersData(finalityProviders);

  const { visualSortField, visualSortDirection, handleSort, handleMobileSort } =
    useFinalityProvidersSort(setSortField, setSortDirection);

  const {
    isSortModalOpen,
    toggleSortModal,
    activeOrder,
    setActiveOrder,
    selectedCriterion,
    setSelectedCriterion,
    setIsSortModalOpen,
  } = useMobileSortModal();

  useEffect(() => {
    if (!isMobile && isSortModalOpen) {
      setIsSortModalOpen(false);
    }
  }, [isMobile, isSortModalOpen, setIsSortModalOpen]);

  const SortIndicator = ({ field }: { field: SortField }) => {
    const isSelected = visualSortField === field;
    const Icon =
      isSelected && visualSortDirection === "asc"
        ? MdKeyboardArrowUp
        : MdKeyboardArrowDown;
    return (
      <span
        className={`inline-flex items-center justify-center px-2 ${isSelected ? "text-primary" : "text-gray-400"}`}
      >
        <Icon size={20} />
      </span>
    );
  };

  const SortButton: React.FC<FinalityProvidersSortButtonProps> = ({
    field,
    label,
    onSort,
  }) => {
    return (
      <button onClick={() => onSort(field)} className="flex items-center">
        {label} <SortIndicator field={field} />
      </button>
    );
  };

  if (!finalityProviders || finalityProviders.length === 0) {
    return <LoadingView />;
  }

  const network = getNetworkConfig().network;
  const createFinalityProviderLink = `https://github.com/babylonlabs-io/networks/tree/main/${
    network == Network.MAINNET ? "bbn-1" : "bbn-test-4"
  }/finality-providers`;

  return (
    <>
      <p>
        Select a finality provider or{" "}
        <a
          href={createFinalityProviderLink}
          target="_blank"
          rel="noopener noreferrer"
          className="sublink text-primary hover:underline"
        >
          create your own
        </a>
        .
      </p>
      <div className="flex gap-3">
        <FinalityProviderSearch onSearch={handleSearch} />
        {isMobile && (
          <button
            onClick={toggleSortModal}
            className="btn btn-outline btn-xs text-sm mt-0 font-normal rounded-xl border-gray-400 p-2 h-auto lg:hidden"
          >
            <BsSortDown className="text-xl" />
          </button>
        )}
      </div>
      {!isMobile && (
        <div className="hidden gap-2 px-4 lg:grid lg:grid-cols-stakingFinalityProvidersDesktop">
          <SortButton
            field="moniker"
            label="Finality Provider"
            onSort={handleSort}
          />
          <SortButton field="btcPk" label="BTC PK" onSort={handleSort} />
          <SortButton
            field="stakeSat"
            label="Total Delegation"
            onSort={handleSort}
          />
          <SortButton
            field="commission"
            label="Commission"
            onSort={handleSort}
          />
        </div>
      )}
      <div
        id="finality-providers"
        className="no-scrollbar max-h-[21rem] overflow-y-auto"
      >
        <InfiniteScroll
          className="flex flex-col gap-4"
          dataLength={sortedProviders.length}
          next={queryMeta.next}
          hasMore={queryMeta.hasMore}
          loader={queryMeta.isFetchingMore ? <LoadingTableList /> : null}
          scrollableTarget="finality-providers"
        >
          {sortedProviders.map((fp) => (
            <FinalityProvider
              key={fp.btcPk}
              moniker={fp.description?.moniker}
              website={fp.description?.website}
              pkHex={fp.btcPk}
              stakeSat={fp.activeTVLSat}
              commission={fp.commission}
              selected={selectedFinalityProvider?.btcPk === fp.btcPk}
              onClick={() => {
                onFinalityProviderChange(fp.btcPk);
              }}
            />
          ))}
        </InfiniteScroll>
      </div>
      {isSortModalOpen && (
        <FinalityProviderMobileSortModal
          open={isSortModalOpen}
          onClose={() => setIsSortModalOpen(false)}
          handleMobileSort={handleMobileSort}
          activeOrder={activeOrder}
          setActiveOrder={setActiveOrder}
          selectedCriterion={selectedCriterion}
          setSelectedCriterion={setSelectedCriterion}
        />
      )}
    </>
  );
};
