import debounce from "lodash/debounce";
import { useCallback, useEffect, useMemo, useState } from "react";
import { BsSortDown } from "react-icons/bs";
import { MdKeyboardArrowDown, MdKeyboardArrowUp } from "react-icons/md";
import InfiniteScroll from "react-infinite-scroll-component";

import {
  LoadingTableList,
  LoadingView,
} from "@/app/components/Loading/Loading";
import { QueryMeta } from "@/app/types/api";
import { FinalityProvider as FinalityProviderInterface } from "@/app/types/finalityProviders";
import { getNetworkConfig } from "@/config/network.config";
import { Network } from "@/utils/wallet/wallet_provider";

import { FinalityProviderSearch } from "../../FinalityProviders/FinalityProviderSearch";
import { FinalityProviderMobileSortModal } from "../../Modals/FinalityProviderMobileSortModal";

import { FinalityProvider } from "./FinalityProvider";

interface FinalityProvidersProps {
  finalityProviders: FinalityProviderInterface[] | undefined;
  selectedFinalityProvider: FinalityProviderInterface | undefined;
  onFinalityProviderChange: (btcPkHex: string) => void;
  queryMeta: QueryMeta;
}

export type SortField = "moniker" | "btcPk" | "stakeSat" | "commission";
export type SortDirection = "asc" | "desc";

const getSortValue = (
  provider: FinalityProviderInterface,
  field: SortField,
) => {
  switch (field) {
    case "moniker":
      return provider.description?.moniker || "";
    case "btcPk":
      return provider.btcPk;
    case "stakeSat":
      return provider.activeTVLSat;
    case "commission":
      return parseFloat(provider.commission);
    default:
      return 0;
  }
};

export const FinalityProviders: React.FC<FinalityProvidersProps> = ({
  finalityProviders,
  selectedFinalityProvider,
  onFinalityProviderChange,
  queryMeta,
}) => {
  const [filteredProviders, setFilteredProviders] = useState(finalityProviders);
  const [sortedProviders, setSortedProviders] = useState<
    FinalityProviderInterface[]
  >([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<SortField>("stakeSat");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [visualSortField, setVisualSortField] = useState<SortField>("stakeSat");
  const [visualSortDirection, setVisualSortDirection] =
    useState<SortDirection>("desc");

  const [isSortModalOpen, setIsSortModalOpen] = useState(false);

  const toggleSortModal = () => setIsSortModalOpen(!isSortModalOpen);

  const debouncedSearch = useMemo(
    () =>
      debounce((searchTerm: string) => {
        const filtered = finalityProviders?.filter(
          (fp) =>
            fp.description?.moniker
              ?.toLowerCase()
              .includes(searchTerm.toLowerCase()) ||
            fp.btcPk.toLowerCase().includes(searchTerm.toLowerCase()),
        );
        setFilteredProviders(filtered);
      }, 300),
    [finalityProviders],
  );

  const sortProviders = useCallback(
    (
      providers: FinalityProviderInterface[] | undefined,
      field: SortField,
      direction: SortDirection,
    ) => {
      if (!providers) {
        setSortedProviders([]);
        return;
      }

      const sorted = [...providers].sort((a, b) => {
        const aValue = getSortValue(a, field);
        const bValue = getSortValue(b, field);
        return direction === "asc"
          ? aValue > bValue
            ? 1
            : -1
          : bValue > aValue
            ? 1
            : -1;
      });

      setSortedProviders(sorted);
    },
    [],
  );

  const debouncedHandleSort = useMemo(
    () =>
      debounce((field: SortField, direction: SortDirection) => {
        if (window.innerWidth >= 768) {
          setSortField(field);
          setSortDirection(direction);
          sortProviders(filteredProviders, field, direction);
        }
      }, 300),
    [filteredProviders, sortProviders],
  );

  useEffect(() => {
    setFilteredProviders(finalityProviders);
  }, [finalityProviders]);

  useEffect(() => {
    debouncedSearch(searchTerm);
    return () => debouncedSearch.cancel();
  }, [searchTerm, debouncedSearch]);

  useEffect(() => {
    sortProviders(filteredProviders, sortField, sortDirection);
  }, [filteredProviders, sortField, sortDirection, sortProviders]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768 && isSortModalOpen) {
        setIsSortModalOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isSortModalOpen]);

  const handleSearch = useCallback((newSearchTerm: string) => {
    setSearchTerm(newSearchTerm);
  }, []);

  const handleSort = useCallback(
    (field: SortField) => {
      if (window.innerWidth >= 768) {
        let newDirection: SortDirection;
        if (field === visualSortField) {
          newDirection = visualSortDirection === "asc" ? "desc" : "asc";
          setVisualSortDirection(newDirection);
        } else {
          newDirection = "asc";
          setVisualSortField(field);
          setVisualSortDirection(newDirection);
        }
        debouncedHandleSort(field, newDirection);
      }
    },
    [visualSortField, visualSortDirection, debouncedHandleSort],
  );

  const handleMobileSort = (order: SortDirection, criteria: SortField) => {
    const field = criteria;
    const direction = order;

    setVisualSortField(field);
    setVisualSortDirection(direction);

    sortProviders(filteredProviders, field, direction);
  };

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
        <button
          onClick={toggleSortModal}
          className="btn btn-outline btn-xs text-sm mt-0 font-normal rounded-xl border-gray-400 p-2 h-auto lg:hidden"
        >
          <BsSortDown className="text-xl" />
        </button>
      </div>
      <div className="hidden gap-2 px-4 lg:grid lg:grid-cols-stakingFinalityProvidersDesktop">
        <button
          onClick={() => handleSort("moniker")}
          className="flex items-center"
        >
          Finality Provider <SortIndicator field="moniker" />
        </button>
        <button
          onClick={() => handleSort("btcPk")}
          className="flex items-center"
        >
          BTC PK <SortIndicator field="btcPk" />
        </button>
        <button
          onClick={() => handleSort("stakeSat")}
          className="flex items-center"
        >
          Total Delegation <SortIndicator field="stakeSat" />
        </button>
        <button
          onClick={() => handleSort("commission")}
          className="flex items-center"
        >
          Commission <SortIndicator field="commission" />
        </button>
      </div>
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
          {" "}
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
        />
      )}
    </>
  );
};
