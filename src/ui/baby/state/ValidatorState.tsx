import { type PropsWithChildren, useCallback, useMemo, useState } from "react";

import { useValidators } from "@/ui/baby/hooks/api/useValidators";
import { createStateUtils } from "@/ui/common/utils/createStateUtils";

type ListView = "table" | "cards";

interface Filter {
  search: string;
}

interface Validator {
  address: string;
  logoUrl: string;
  name: string;
  apr: number;
  votingPower: number;
  commission: number;
}

interface ValidatorState {
  loading: boolean;
  filter: Filter;
  listView: ListView;
  validators: Validator[];
  changeListView: (value: ListView) => void;
  search: (value: string) => void;
}

const { StateProvider, useState: useValidatorState } =
  createStateUtils<ValidatorState>({
    loading: false,
    filter: { search: "" },
    listView: "table",
    validators: [],
    changeListView: () => {},
    search: () => {},
  });

function StakingState({ children }: PropsWithChildren) {
  const [listView, setListView] = useState<ListView>("table");
  const [filter, setFilter] = useState<Filter>({ search: "" });

  const { data: validatorList = [], isLoading: loading } = useValidators();

  // TODO: properly calculate missing apr and votingPower fields
  const validators = useMemo(
    () =>
      validatorList.map((validator) => ({
        address: validator.operatorAddress,
        logoUrl: "",
        name: validator.description.moniker,
        apr: 0,
        votingPower: 0,
        commission: parseFloat(validator.commission.commissionRates.rate),
      })),
    [validatorList],
  );
  const filteredValidators = useMemo(() => {
    const searchTerm = filter.search.toLowerCase();

    return validators.filter(
      (validator) =>
        validator.name?.toLowerCase().includes(searchTerm) ?? false,
    );
  }, [validators, filter]);

  const search = useCallback((value: string) => {
    setFilter({ search: value });
  }, []);

  const context = useMemo(
    () => ({
      loading,
      filter,
      listView,
      validators: filteredValidators,
      search,
      changeListView: setListView,
    }),
    [filter, filteredValidators, listView, loading, search],
  );

  return <StateProvider value={context}>{children}</StateProvider>;
}

export { StakingState, useValidatorState };
