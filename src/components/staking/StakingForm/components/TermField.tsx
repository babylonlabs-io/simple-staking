import { HiddenField, NumberField, Text } from "@babylonlabs-io/bbn-core-ui";

interface TermFieldProps {
  min?: number;
  max?: number;
  defaultValue?: number;
}

export function TermField({ min = 0, defaultValue }: TermFieldProps) {
  if (defaultValue) {
    return <HiddenField name="term" defaultValue={defaultValue.toString()} />;
  }

  const label = (
    <div className="flex flex-1 justify-between items-center">
      <Text as="span" variant="body1">
        Term
      </Text>
      <Text as="span" variant="body2">
        min term is {min} blocks
      </Text>
    </div>
  );

  return (
    <NumberField
      name="term"
      controlClassName="mb-6 [&_.bbn-input]:py-2.5 [&_.bbn-form-control-title]:mb-1 [&_.bbn-input-field]:text-base"
      label={label}
      placeholder="Blocks"
    />
  );
}
