interface AmountInputProps {
  value: string;
  onChange: (value: string) => void;
  label: string;
  placeholder: string;
}

export function AmountInput({
  value,
  onChange,
  label,
  placeholder,
}: AmountInputProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-accent-primary mb-1">
        {label}
      </label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-secondary-highlight py-[14px] px-6 rounded border border-transparent text-accent-primary outline-none"
        placeholder={placeholder}
      />
    </div>
  );
}
