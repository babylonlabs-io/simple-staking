/**
 * Import polyfill for array.toSorted
 */
import "core-js/features/array/to-sorted";

import {
  FinalityProviderItem,
  Loader,
  Table,
  TableElement,
} from "@babylonlabs-io/core-ui";

import warningOctagon from "@/ui/common/assets/warning-octagon.svg";
import warningTriangle from "@/ui/common/assets/warning-triangle.svg";
import { Hash } from "@/ui/common/components/Hash/Hash";
import { StatusView } from "@/ui/common/components/Staking/FinalityProviders/FinalityProviderTableStatusView";
import { getNetworkConfigBTC } from "@/ui/common/config/network/btc";
import { useFinalityProviderBsnState } from "@/ui/common/state/FinalityProviderBsnState";
import { FinalityProviderStateLabels } from "@/ui/common/types/finalityProviders";
import { satoshiToBtc } from "@/ui/common/utils/btc";
import { maxDecimals } from "@/ui/common/utils/maxDecimals";

interface Props {
  selectedFP?: string;
  layout: "grid" | "list";
  onSelectRow?: (btcPk: string) => void;
}

export const FinalityProviderTable = ({
  selectedFP,
  onSelectRow,
  layout = "grid",
}: Props) => {
  const { isFetching, finalityProviders, hasError, isRowSelectable } =
    useFinalityProviderBsnState();

  const { coinSymbol } = getNetworkConfigBTC();

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

  const handleSelect = (btcPk: string) => {
    if (onSelectRow) {
      onSelectRow(btcPk);
    }
  };

  return (
    <>
      {layout === "grid" ? (
        <div className="grid grid-cols-2 gap-4 w-full overflow-scroll max-h-[440px]">
          {finalityProviders.map((fp) => {
            const isSelected = selectedFP === fp.btcPk;
            const isSelectable = isRowSelectable(fp);

            const totalDelegation = maxDecimals(
              satoshiToBtc(fp.activeTVLSat || 0),
              8,
            );
            const commission = maxDecimals(
              (Number(fp.commission) || 0) * 100,
              2,
            );
            const status = FinalityProviderStateLabels[fp.state] || "Unknown";

            return (
              <TableElement
                key={fp.btcPk}
                providerItemProps={{
                  bsnId: fp.bsnId || "",
                  bsnName: fp.chain || "",
                  address: fp.btcPk,
                  provider: {
                    logo_url: fp.logo_url,
                    rank: fp.rank,
                    description: fp.description,
                  },
                }}
                attributes={{
                  Status: status,
                  "Total Delegation": (
                    <>
                      {totalDelegation} {coinSymbol}
                    </>
                  ),
                  Commission: `${commission}%`,
                }}
                isSelected={isSelected}
                isSelectable={isSelectable}
                onSelect={() => handleSelect(fp.btcPk)}
              />
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col gap-4 w-full overflow-scroll max-h-[440px]">
          <Table
            onRowSelect={(row) => handleSelect(row?.address || "")}
            fluid
            selectedRow={selectedFP}
            data={finalityProviders.map((fp) => ({
              id: fp.btcPk || "",
              bsnId: fp.bsnId || "",
              bsnName: fp.chain || "",
              address: fp.btcPk,
              status: FinalityProviderStateLabels[fp.state] || "Unknown",
              provider: {
                logo_url: fp.logo_url,
                rank: fp.rank,
                description: fp.description,
              },
              totalDelegation: maxDecimals(
                satoshiToBtc(fp.activeTVLSat || 0),
                8,
              ),
              commission: maxDecimals((Number(fp.commission) || 0) * 100, 2),
              isSelectable: isRowSelectable(fp),
            }))}
            columns={[
              {
                key: "provider",
                header: "Finality Provider",
                render: (_value, row) => {
                  return (
                    <FinalityProviderItem
                      provider={{
                        logo_url: row.provider.logo_url,
                        rank: row.provider.rank,
                        description: row.provider.description,
                      }}
                      bsnId={row.bsnId}
                      bsnName={row.bsnName}
                      showChain={false}
                    />
                  );
                },
                sorter: (a, b) =>
                  a.provider.description.moniker.localeCompare(
                    b.provider.description.moniker,
                  ),
              },
              {
                key: "address",
                header: "BTC PK",
                render: (_value, row) => (
                  <div className="flex items-center gap-2">
                    <Hash
                      address={true}
                      value={row.address}
                      symbols={8}
                      noFade
                    />
                  </div>
                ),
              },
              {
                key: "totalDelegation",
                header: "Total Delegation",
                render: (_value, row) => (
                  <div className="flex items-center gap-2">
                    {row.totalDelegation} {coinSymbol}
                  </div>
                ),
                sorter: (a, b) => parseFloat(a.totalDelegation) - parseFloat(b.totalDelegation),
              },
              {
                key: "commission",
                header: "Commission",
                render: (_value, row) => (
                  <div className="flex items-center gap-2">
                    {row.commission} %
                  </div>
                ),
                sorter: (a, b) => parseFloat(a.commission) - parseFloat(b.commission),
              },
            ]}
            isRowSelectable={(row) => row.isSelectable}
          />
        </div>
      )}
    </>
  );
};
