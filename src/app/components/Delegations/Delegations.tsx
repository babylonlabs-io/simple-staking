import { LocalStorageDelegation } from "@/types/LocalStorageDelegation";
import { Delegation } from "./Delegation";

interface DelegationsProps {
  data: LocalStorageDelegation[];
}

export const Delegations: React.FC<DelegationsProps> = ({ data }) => {
  return (
    <div className="card gap-4 bg-base-300 p-4">
      <div className="flex w-full">
        <h2 className="font-bold">Staking history</h2>
      </div>
      <div className="grid w-full grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-4">
        {data?.map((delegation) => (
          <Delegation item={delegation} key={delegation.stakingTxID} />
        ))}
      </div>
    </div>
  );
};
