import { type PropsWithChildren, useCallback, useMemo, useState } from "react";

import { useValidatorService } from "@/ui/baby/hooks/services/useValidatorService";
import { createStateUtils } from "@/ui/common/utils/createStateUtils";

import type { ValidatorStatus } from "../types/validator";

type ListView = "table" | "cards";

interface Filter {
  search: string;
  status: ValidatorStatus | "";
  showSlashed: boolean;
}

interface Validator {
  id: string;
  address: string;
  name: string;
  votingPower: number;
  commission: number;
  tokens: number;
  unbondingTime: number;
  status: ValidatorStatus;
  // apr: number;
  // logoUrl: string;
}

interface ValidatorState {
  open: boolean;
  loading: boolean;
  filter: Filter;
  listView: ListView;
  validators: Validator[];
  selectedValidators: Validator[];
  changeListView: (value: ListView) => void;
  search: (value: string) => void;
  handleFilter: (key: keyof Filter, value: string) => void;
  toggleShowSlashed: (value: boolean) => void;
  openModal: () => void;
  closeModal: () => void;
  selectValidator: (addresses: string[]) => void;
}

const { StateProvider, useState: useValidatorState } =
  createStateUtils<ValidatorState>({
    open: false,
    loading: false,
    filter: { search: "", status: "active", showSlashed: false },
    listView: "table",
    validators: [],
    selectedValidators: [],
    changeListView: () => {},
    search: () => {},
    handleFilter: () => {},
    toggleShowSlashed: () => {},
    openModal: () => {},
    closeModal: () => {},
    selectValidator: () => {},
  });

function ValidatorState({ children }: PropsWithChildren) {
  const [open, setOpen] = useState(false);
  const [addresses, setAddresses] = useState<string[]>([]);
  const [listView, setListView] = useState<ListView>("table");
  const [filter, setFilter] = useState<Filter>({
    search: "",
    status: "active",
    showSlashed: false,
  });

  const { validators: validatorList = [], loading } = useValidatorService();

  const validators = useMemo(
    () =>
      validatorList.map((validator) => ({
        id: validator.address,
        ...validator,
      })),
    [validatorList],
  );

  const filteredValidators = useMemo(() => {
    const searchTerm = filter.search.toLowerCase();

    return validators.filter((validator) => {
      const matchesSearch =
        validator.name?.toLowerCase().includes(searchTerm) ?? false;
      if (validator.status === "slashed") {
        return matchesSearch && filter.showSlashed;
      }
      const matchesStatus = filter.status
        ? validator.status === filter.status
        : true;
      return matchesSearch && matchesStatus;
    });
  }, [validators, filter]);

  const validatorMap = useMemo(
    () =>
      validators.reduce(
        (acc, validator) => ({ ...acc, [validator.id]: validator }),
        {} as Record<string, Validator>,
      ),
    [validators],
  );

  const selectedValidators = useMemo(
    () => addresses.map((address) => validatorMap[address]),
    [addresses, validatorMap],
  );

  const search = useCallback((value: string) => {
    setFilter((f) => ({ ...f, search: value }));
  }, []);

  const handleFilter = useCallback((key: keyof Filter, value: string) => {
    setFilter((f) => ({ ...f, [key]: value }));
  }, []);

  const toggleShowSlashed = useCallback((value: boolean) => {
    setFilter((f) => ({ ...f, showSlashed: value }));
  }, []);

  const openModal = useCallback(() => void setOpen(true), []);
  const closeModal = useCallback(() => void setOpen(false), []);

  const context = useMemo(
    () => ({
      open,
      loading,
      filter,
      listView,
      validators: filteredValidators,
      selectedValidators,
      search,
      handleFilter,
      toggleShowSlashed,
      openModal,
      closeModal,
      changeListView: setListView,
      selectValidator: setAddresses,
    }),
    [
      filter,
      filteredValidators,
      listView,
      loading,
      open,
      selectedValidators,
      openModal,
      search,
      handleFilter,
      toggleShowSlashed,
      setAddresses,
      closeModal,
    ],
  );

  return <StateProvider value={context}>{children}</StateProvider>;
}

export { useValidatorState, ValidatorState };
