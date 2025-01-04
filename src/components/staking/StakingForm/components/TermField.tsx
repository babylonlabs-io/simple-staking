import { HiddenField, NumberField } from "@babylonlabs-io/bbn-core-ui";

interface TermFieldProps {
  min?: number;
  max?: number;
}

export function TermField({ min = 0, max = 0 }: TermFieldProps) {
  if (min === max) {
    return <HiddenField name="term" defaultValue={max.toString()} />;
  }

  const label = (
    <div className="flex flex-1 justify-between items-center">
      <span>Term</span>
      <span>min term is {min} blocks</span>
    </div>
  );

  return (
    <NumberField
      name="term"
      controlClassName="mb-4"
      label={label}
      placeholder="Blocks"
    />
  );
}
