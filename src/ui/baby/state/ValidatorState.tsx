import { type PropsWithChildren, useCallback, useMemo, useState } from "react";

import { usePool } from "@/ui/baby/hooks/api/usePool";
import { useValidators } from "@/ui/baby/hooks/api/useValidators";
import { createStateUtils } from "@/ui/common/utils/createStateUtils";

type ListView = "table" | "cards";

interface Filter {
  search: string;
}

interface Validator {
  address: string;
  name: string;
  votingPower: number;
  commission: number;
  tokens: number;
  // apr: number;
  // logoUrl: string;
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

  const { data: validatorList = [], isLoading } = useValidators();
  const { data: pool, isLoading: isPoolLoading } = usePool();

  const validators = useMemo(
    () =>
      validatorList.map((validator) => ({
        address: validator.operatorAddress,
        name: validator.description.moniker,
        tokens: parseFloat(validator.tokens),
        votingPower: parseFloat(validator.tokens) / (pool?.bondedTokens ?? 0),
        commission: parseFloat(validator.commission.commissionRates.rate),
        // apr: 0,
        // logoUrl: "",
      })),
    [validatorList, pool?.bondedTokens],
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
      loading: isLoading || isPoolLoading,
      filter,
      listView,
      validators: filteredValidators,
      search,
      changeListView: setListView,
    }),
    [filter, filteredValidators, listView, isLoading, isPoolLoading, search],
  );

  return <StateProvider value={context}>{children}</StateProvider>;
}

export { StakingState, useValidatorState };
