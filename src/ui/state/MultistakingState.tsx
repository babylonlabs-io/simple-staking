import { useMemo, useState, type PropsWithChildren } from "react";
import { number, object, ObjectSchema, string } from "yup";

import { validateDecimalPoints } from "@/ui/components/Staking/Form/validation/validation";
import { getNetworkConfigBTC } from "@/ui/config/network/btc";
import { useBTCWallet } from "@/ui/context/wallet/BTCWalletProvider";
import { satoshiToBtc } from "@/ui/utils/btc";
import { createStateUtils } from "@/ui/utils/createStateUtils";
import { formatNumber, formatStakingAmount } from "@/ui/utils/formTransforms";

import { useBalanceState } from "./BalanceState";
import { StakingModalPage, useStakingState } from "./StakingState";

const { coinName } = getNetworkConfigBTC();

export interface MultistakingFormFields {
  finalityProvider: string;
  amount: number;
  term: number;
  feeRate: number;
  feeAmount: number;
}

export interface MultistakingState {
  stakingModalPage: StakingModalPage;
  setStakingModalPage: (page: StakingModalPage) => void;
  MAX_FINALITY_PROVIDERS: number;
  validationSchema?: ObjectSchema<MultistakingFormFields>;
}

const { StateProvider, useState: useMultistakingState } =
  createStateUtils<MultistakingState>({
    stakingModalPage: StakingModalPage.DEFAULT,
    setStakingModalPage: () => {},
    MAX_FINALITY_PROVIDERS: 1,
    validationSchema: undefined,
  });

export function MultistakingState({ children }: PropsWithChildren) {
  const [stakingModalPage, setStakingModalPage] = useState<StakingModalPage>(
    StakingModalPage.DEFAULT,
  );
  const MAX_FINALITY_PROVIDERS = 1;
  const { publicKeyNoCoord } = useBTCWallet();
  const { stakableBtcBalance } = useBalanceState();
  const { stakingInfo } = useStakingState();

  const validationSchema = useMemo(
    () =>
      object()
        .shape({
          finalityProvider: string()
            .meta({ priority: 1 })
            .required("Add Finality Provider")
            .test(
              "same-public-key",
              "Cannot select a finality provider with the same public key as the wallet",
              function (value: string | undefined, context: TestContext) {
                if (value === publicKeyNoCoord) {
                  return context.createError({
                    message:
                      "Cannot select a finality provider with the same public key as the wallet",
                    type: "critical",
                  });
                }
                return true;
              },
            ),

          term: number()
            .transform(formatNumber)
            .typeError("Staking term must be a valid number.")
            .required("Staking term is the required field.")
            .integer("Staking term must not have decimal points.")
            .moreThan(0, "Staking term must be greater than 0.")
            .min(
              stakingInfo?.minStakingTimeBlocks ?? 0,
              `Staking term must be at least ${stakingInfo?.minStakingTimeBlocks ?? 0} blocks.`,
            )
            .max(
              stakingInfo?.maxStakingTimeBlocks ?? 0,
              `Staking term must be no more than ${stakingInfo?.maxStakingTimeBlocks ?? 0} blocks.`,
            ),

          amount: number()
            .meta({ priority: 1 })
            .transform(formatStakingAmount)
            .typeError("Staking amount must be a valid number.")
            .required("Enter BTC Amount to Stake")
            .moreThan(0, "Staking amount must be greater than 0.")
            .min(
              stakingInfo?.minStakingAmountSat ?? 0,
              `Minimum Staking ${satoshiToBtc(
                stakingInfo?.minStakingAmountSat ?? 0,
              )} ${coinName}`,
            )
            .max(
              stakingInfo?.maxStakingAmountSat ?? 0,
              `Maximum Staking ${satoshiToBtc(stakingInfo?.maxStakingAmountSat ?? 0)} ${coinName}`,
            )
            .test(
              "balance-check",
              "Staking Amount Exceeds Balance",
              (value) => {
                if (!value) return true;
                return value <= stakableBtcBalance;
              },
            )
            .test(
              "decimal-points",
              "Staking amount must have no more than 8 decimal points.",
              function (_, context) {
                if (!validateDecimalPoints(context.originalValue)) {
                  return this.createError({
                    message:
                      "Staking amount must have no more than 8 decimal points.",
                    type: "critical",
                  });
                }
                return true;
              },
            )
            .test("insufficient-funds", "Insufficient BTC", () => true),

          feeRate: number()
            .transform(formatNumber)
            .typeError("Staking fee rate must be a valid number.")
            .required("Staking fee rate is the required field.")
            .moreThan(0, "Staking fee rate must be greater than 0.")
            .min(
              stakingInfo?.minFeeRate ?? 0,
              "Selected fee rate is lower than the hour fee",
            )
            .max(
              stakingInfo?.maxFeeRate ?? 0,
              "Selected fee rate is higher than the hour fee",
            ),

          feeAmount: number()
            .transform(formatNumber)
            .typeError("Staking fee amount must be a valid number.")
            .required("Staking fee amount is the required field.")
            .moreThan(0, "Staking fee amount must be greater than 0."),
        })
        .required(),
    [publicKeyNoCoord, stakingInfo, stakableBtcBalance],
  );

  const context = useMemo(
    () => ({
      stakingModalPage,
      setStakingModalPage,
      MAX_FINALITY_PROVIDERS,
      validationSchema,
    }),
    [
      stakingModalPage,
      setStakingModalPage,
      MAX_FINALITY_PROVIDERS,
      validationSchema,
    ],
  );

  return <StateProvider value={context}>{children}</StateProvider>;
}

export { useMultistakingState };
