import { FinalityProvider as FinalityProviderInterface } from "@/app/api/getFinalityProviders";
import { FinalityProvider } from "./FinalityProvider";

interface StakingProps {
  amount: number;
  onAmountChange: (amount: number) => void;
  term: number;
  onTermChange: (term: number) => void;
  disabled: boolean;
  finalityProviders: FinalityProviderInterface[] | undefined;
  selectedFinalityProvider: FinalityProviderInterface | undefined;
  // called when the user selects a finality provider
  onFinalityProviderChange: (btcPkHex: string) => void;
  onSign: () => void;
}

export const Staking: React.FC<StakingProps> = ({
  amount,
  onAmountChange,
  term,
  onTermChange,
  disabled,
  finalityProviders,
  selectedFinalityProvider,
  onFinalityProviderChange,
  onSign,
}) => {
  const signReady = amount > 0 && term > 0 && selectedFinalityProvider;

  return (
    <div className="card flex flex-col gap-2 bg-base-300 p-4 shadow-sm lg:flex-1">
      <h3 className="mb-4 font-bold">Staking</h3>
      <div className="flex flex-col gap-4 lg:flex-row">
        <div className="flex flex-1 flex-col gap-4">
          <div className="flex flex-col gap-1">
            <p className="text-sm dark:text-neutral-content">Step 1</p>
            <p>Select a BTC Finality Provider or create your own</p>
          </div>
          <div className="hidden gap-2 px-4 lg:grid lg:grid-cols-stakingFinalityProviders">
            <p>Finality Provider</p>
            <p>BTC PK</p>
            <p>Delegation</p>
            <p>Comission</p>
          </div>
          <div className="no-scrollbar flex max-h-[21rem] flex-col gap-4 overflow-y-auto">
            {finalityProviders?.map((fp) => (
              <FinalityProvider
                key={fp.btc_pk}
                moniker={fp.description.moniker}
                pkHex={fp.btc_pk}
                stake={fp.active_tvl}
                comission={fp.commission}
                selected={selectedFinalityProvider?.btc_pk === fp.btc_pk}
                onClick={() => onFinalityProviderChange(fp.btc_pk)}
              />
            ))}
          </div>
        </div>
        <div className="flex flex-1 flex-col gap-4">
          <div className="flex flex-col gap-1">
            <p className="text-sm dark:text-neutral-content">Step 2</p>
            <p>Set up staking terms</p>
          </div>
          <div className="flex flex-1 flex-col">
            <div className="flex flex-1 flex-col">
              <label className="form-control w-full flex-1">
                <div className="label pt-0">
                  <span className="label-text-alt text-base">Amount</span>
                </div>
                <input
                  type="number"
                  placeholder="BTC"
                  className="no-focus input input-bordered w-full"
                  min={0.00001}
                  step={0.00001}
                  value={amount}
                  onChange={(e) => onAmountChange(Number(e.target.value))}
                  disabled={disabled}
                />
                <div className="label flex justify-end">
                  {/* TODO add env variable */}
                  <span className="label-text-alt">min stake is 0.1 BTC</span>
                </div>
              </label>
              <label className="form-control w-full flex-1">
                <div className="label">
                  <span className="label-text-alt text-base">Term</span>
                </div>
                <input
                  type="number"
                  placeholder="Blocks"
                  className="no-focus input input-bordered w-full"
                  min={1}
                  max={454}
                  value={term}
                  onChange={(e) => onTermChange(Number(e.target.value))}
                  disabled={disabled}
                />
                <div className="label flex justify-end">
                  {/* TODO add env variable */}
                  <span className="label-text-alt">min stake is 0.1 BTC</span>
                </div>
              </label>
            </div>
            <div className="flex flex-col gap-4">
              <div className="form-control">
                <label className="label cursor-pointer justify-start gap-2">
                  <input
                    type="checkbox"
                    defaultChecked
                    className="checkbox-primary checkbox"
                  />
                  <span className="label-text">I accept terms of usage</span>
                </label>
              </div>
              <button
                className="btn btn-primary mt-2 w-full uppercase"
                disabled={disabled || !signReady}
                onClick={onSign}
              >
                {/* TODO change from Sign to Preview once Modal is done */}
                Sign
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
