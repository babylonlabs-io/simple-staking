import { maxDecimals } from "@/ui/common/utils/maxDecimals";
import { useBbnQuery } from "@/ui/legacy/hooks/client/rpc/queries/useBbnQuery";
import { ubbnToBaby } from "@/ui/legacy/utils/bbn";

export const BabyAmountBalanceInfo = () => {
  const { balanceQuery } = useBbnQuery();

  const bbnBalance = balanceQuery.data || 0;
  const tbabyBalance = ubbnToBaby(bbnBalance);

  return (
    <div className="flex text-sm flex-row justify-between w-full content-center">
      <div>
        Stakable:{" "}
        <span className="cursor-default">{maxDecimals(tbabyBalance, 6)}</span>{" "}
        BABY
      </div>
    </div>
  );
};
