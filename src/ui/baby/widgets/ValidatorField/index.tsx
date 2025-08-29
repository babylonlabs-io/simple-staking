import { FinalityProviderSubsection, useField } from "@babylonlabs-io/core-ui";
import { useEffect } from "react";

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
    handleFilter,
    toggleShowSlashed,
    selectValidator,
  } = useValidatorState();

  const handleSelectValidator = (validator: Validator) => {
    const set = new Set(value);
    set.add(validator.address);
    onChange(Array.from(set));
    onBlur();
  };

  const handleRemoveValidatorById = (id?: string) => {
    if (!id) return;
    const set = new Set(value);
    set.delete(id);
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
      <FinalityProviderSubsection
        actionText="Select Validator"
        max={1}
        items={selectedValidators.map((v, index) => ({
          bsnId: v.id,
          bsnName: v.name,
          provider: { rank: index + 1, description: { moniker: v.name } },
        }))}
        onAdd={openModal}
        onRemove={handleRemoveValidatorById}
        showChain={false}
      />
      <ValidatorTable
        open={open}
        searchTerm={filter.search}
        status={filter.status}
        showSlashed={filter.showSlashed}
        validators={validators}
        onClose={handleClose}
        onSearch={search}
        onStatusChange={(v) => handleFilter("status", v)}
        onShowSlashedChange={toggleShowSlashed}
        onSelect={handleSelectValidator}
      />
    </>
  );
}
