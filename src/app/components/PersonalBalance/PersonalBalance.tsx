import { BalanceItem } from "./BalanceItem";

export function PersonalBalance() {
  return (
    <div className="card flex flex-col gap-2 items-stretch sm:justify-between sm:items-center bg-base-300 shadow-sm sm:flex-row">
      <div className="flex flex-col gap-2 card p-4 bg-base-400">
        <h3 className="mb-4 font-bold xl:mb-0">Bitcoin Balance</h3>

        <div className="flex flex-col gap-2 md:flex-row md:items-center">
          <BalanceItem label="Total" value="100.134 BTC" />

          <div className="divider xl:divider-horizontal my-0" />

          <BalanceItem label="Stakable" value="0.134 BTC" />
        </div>
      </div>

      <div className="flex flex-col gap-2 card p-4 bg-base-400">
        <h3 className="mb-4 font-bold sm:text-right xl:mb-0">
          Babylon Balance
        </h3>

        <div className="flex flex-col text-right gap-2 md:flex-row md:items-center">
          <BalanceItem
            className="sm:justify-end"
            label="Total"
            value="100.134 BBN"
          />

          <div className="divider xl:divider-horizontal my-0" />

          <BalanceItem
            className="sm:justify-end"
            label="Claimable Reward"
            value={
              <button className="btn btn-primary h-auto min-h-fit w-fit p-0.5 rounded">
                0.134 BBN
              </button>
            }
          />
        </div>
      </div>
    </div>
  );
}
