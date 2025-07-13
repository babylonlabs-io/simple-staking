interface Validator {
  operatorAddress: string;
  description?: {
    moniker: string;
  };
}

interface ValidatorSelectorProps {
  validators: Validator[];
  value: string;
  onChange: (value: string) => void;
  label: string;
}

export function ValidatorSelector({
  validators,
  value,
  onChange,
  label,
}: ValidatorSelectorProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-accent-primary mb-1">
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-secondary-highlight py-[14px] px-6 rounded border border-transparent text-accent-primary outline-none"
      >
        <option value="">Select a validator</option>
        {validators.map((validator) => (
          <option
            key={validator.operatorAddress}
            value={validator.operatorAddress}
          >
            {validator.description?.moniker || validator.operatorAddress}
          </option>
        ))}
      </select>
    </div>
  );
}
