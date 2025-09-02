import { useMemo, useState, type PropsWithChildren } from "react";

import { createStateUtils } from "@/ui/common/utils/createStateUtils";

export type BtcStakeDraft = {
  finalityProviders?: Record<string, string>;
  amount?: string;
  term?: string;
  feeRate?: string;
  feeAmount?: string;
};

export type BabyStakeDraft = {
  amount?: string;
  validatorAddresses?: string[];
  feeAmount?: string;
};

interface FormPersistenceContext {
  btcStakeDraft?: BtcStakeDraft | undefined;
  babyStakeDraft?: BabyStakeDraft | undefined;
  setBtcStakeDraft: (draft?: BtcStakeDraft) => void;
  setBabyStakeDraft: (draft?: BabyStakeDraft) => void;
}

const { StateProvider, useState: useFormPersistenceState } =
  createStateUtils<FormPersistenceContext>({
    btcStakeDraft: undefined,
    babyStakeDraft: undefined,
    setBtcStakeDraft: () => {},
    setBabyStakeDraft: () => {},
  });

export function FormPersistenceState({ children }: PropsWithChildren) {
  const [btcStakeDraft, setBtcStakeDraft] = useState<BtcStakeDraft | undefined>(
    undefined,
  );
  const [babyStakeDraft, setBabyStakeDraft] = useState<
    BabyStakeDraft | undefined
  >(undefined);

  const context = useMemo(
    () => ({
      btcStakeDraft,
      babyStakeDraft,
      setBtcStakeDraft,
      setBabyStakeDraft,
    }),
    [btcStakeDraft, babyStakeDraft, setBtcStakeDraft, setBabyStakeDraft],
  );

  return <StateProvider value={context}>{children}</StateProvider>;
}

export { useFormPersistenceState };
