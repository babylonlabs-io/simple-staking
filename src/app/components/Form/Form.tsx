import { FinalityProvider } from "@/mock/finality_providers";

interface FormProps {
  amount: number;
  onAmountChange: (amount: number) => void;
  duration: number;
  onDurationChange: (term: number) => void;
  enabled: boolean;
  finalityProviders: FinalityProvider[];
  finalityProvider: FinalityProvider | undefined;
  onFinalityProviderChange: (btcPkHex: string) => void;
  onSign: () => void;
}

export const Form: React.FC<FormProps> = ({
  amount,
  onAmountChange,
  duration: term,
  onDurationChange: onTermChange,
  enabled,
  finalityProviders,
  finalityProvider,
  onFinalityProviderChange,
  onSign,
}) => {
  const signReady = amount > 0 && term > 0 && finalityProvider;
  return (
    <div className="card bg-base-300">
      <div className="card-body items-center gap-4">
        <label className="form-control w-full max-w-sm">
          <div className="label">
            <span className="label-text">Amount</span>
            <span className="label-text-alt">BTC</span>
          </div>
          <input
            type="number"
            placeholder="BTC"
            className="input input-bordered w-full"
            min={0.00001}
            step={0.00001}
            value={amount}
            onChange={(e) => onAmountChange(Number(e.target.value))}
            disabled={!enabled}
          />
        </label>
        <label className="form-control w-full max-w-sm">
          <div className="label">
            <span className="label-text">Duration</span>
            <span className="label-text-alt">Days</span>
          </div>
          <input
            type="number"
            placeholder="Days"
            className="input input-bordered w-full"
            min={1}
            max={454}
            value={term}
            onChange={(e) => onTermChange(Number(e.target.value))}
            disabled={!enabled}
          />
        </label>
        <label className="form-control w-full max-w-sm">
          <div className="label">
            <span className="label-text">Finality provider</span>
          </div>
          <select
            className="select select-bordered"
            onChange={(e) => onFinalityProviderChange(e.target.value)}
            value={finalityProvider ? finalityProvider.btc_pk_hex : "-"}
            disabled={!enabled}
          >
            <option key="-" value="-">
              Choose a finality provider
            </option>
            {finalityProviders.map((provider) => (
              <option key={provider.btc_pk_hex} value={provider.btc_pk_hex}>
                {provider.description.moniker}
              </option>
            ))}
          </select>
        </label>
        <button
          className="btn btn-primary mt-2 w-full max-w-sm uppercase"
          disabled={!enabled || !signReady}
          onClick={onSign}
        >
          Sign
        </button>
      </div>
    </div>
  );
};
