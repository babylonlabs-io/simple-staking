import { QueryMeta } from "@/app/types/api";
import { FinalityProvider as FinalityProviderInterface } from "@/app/types/finalityProviders";

import { FinalityProviders } from "../FinalityProviders/FinalityProviders";
// import { Stakers } from "../Stakers/Stakers";

interface StakersFinalityProvidersProps {
  finalityProviders: FinalityProviderInterface[] | undefined;
  totalActiveTVLSat?: number;
  connected?: boolean;
  queryMeta: QueryMeta;
}

export const StakersFinalityProviders: React.FC<
  StakersFinalityProvidersProps
> = ({ finalityProviders, totalActiveTVLSat, connected, queryMeta }) => {
  // At this point of time we disable the Stakers tab
  return (
    <div>
      <FinalityProviders
        data={finalityProviders}
        totalActiveTVLSat={totalActiveTVLSat}
        queryMeta={{
          next: queryMeta.next,
          hasMore: queryMeta.hasMore,
          isFetchingMore: queryMeta.isFetchingMore,
        }}
      />
    </div>
  );

  // TODO uncomment the code below this when the Stakers tab is enabled

  // const [activeTab, setActiveTab] = useState(0);

  // const tabs = ["Top Stakers", "Finality Providers"];

  // // If wallet is not connected, show all tabs
  // // If wallet is connected, show only the active tab + tab header on mobile
  // const getActiveTabContent = (index: number) => {
  //   const desktopStyles = "lg:flex lg:flex-1";

  //   if (!connected) {
  //     return `block ${desktopStyles}`;
  //   } else {
  //     return `${activeTab === index ? "block" : "hidden"} ${desktopStyles}`;
  //   }
  // };

  // return (
  //   <div className="flex flex-col gap-6">
  //     <div
  //       role="tablist"
  //       className={`${connected ? "tabs tabs-bordered lg:hidden" : "hidden"}`}
  //     >
  //       {tabs.map((tab, index) => (
  //         <a
  //           key={index}
  //           role="tab"
  //           // space left intentionally so the server and client side match
  //           className={`tab${activeTab === index ? " tab-active" : ""}`}
  //           onClick={() => setActiveTab(index)}
  //         >
  //           {tab}
  //         </a>
  //       ))}
  //     </div>
  //     <div className="flex flex-col gap-6 lg:flex-row">
  //       <div className={getActiveTabContent(0)}>
  //         <Stakers />
  //       </div>
  //       <div className={getActiveTabContent(1)}>
  //         <FinalityProviders
  //           data={finalityProviders}
  //           totalActiveTVL={totalActiveTVL}
  //         />
  //       </div>
  //     </div>
  //   </div>
  // );
};
