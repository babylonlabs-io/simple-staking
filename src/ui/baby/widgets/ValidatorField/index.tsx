import { useField } from "@babylonlabs-io/core-ui";
import { useEffect } from "react";

import { ListSubsection } from "@/ui/baby/components/ListSubSection";
import { ValidatorItem } from "@/ui/baby/components/ValidatorItem";
import { ValidatorTable } from "@/ui/baby/components/ValidatorTable";
import { useValidatorState } from "@/ui/baby/state/ValidatorState";

interface Validator {
  id: string;
  address: string;
  name: string;
  votingPower: number;
  commission: number;
  tokens: number;
  // apr: number;
  // logoUrl: string;
}

export function ValidatorField() {
  const { value, onChange, onBlur } = useField<string[]>({
    name: "validatorAddresses",
    defaultValue: [],
  });
  const {
    open,
    filter,
    validators,
    selectedValidators,
    openModal,
    closeModal,
    search,
    selectValidator,
  } = useValidatorState();

  const handleSelectValidator = (validator: Validator) => {
    const set = new Set(value);
    set.add(validator.address);
    onChange(Array.from(set));
    onBlur();
  };

  const handleRemoveValidator = (validator: Validator) => {
    const set = new Set(value);
    set.delete(validator.address);
    onChange(Array.from(set));
    onBlur();
  };

  const handleClose = () => {
    closeModal();
    onBlur();
  };

  useEffect(() => {
    selectValidator(value);
  }, [value, selectValidator]);

  return (
    <>
      <ListSubsection
        title="Selected Validator"
        max={1}
        items={selectedValidators}
        renderItem={(item) => <ValidatorItem name={item.name} />}
        onAdd={openModal}
        onRemove={handleRemoveValidator}
      />
      <ValidatorTable
        open={open}
        searchTerm={filter.search}
        validators={validators}
        onClose={handleClose}
        onSearch={search}
        onSelect={handleSelectValidator}
      />
    </>
  );
}
