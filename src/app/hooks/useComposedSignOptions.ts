import { SigningStep } from "@babylonlabs-io/btc-staking-ts";
import { SignPsbtOptions } from "@babylonlabs-io/wallet-connector";
import { useCallback } from "react";

import { useBTCWallet } from "@/app/context/wallet/BTCWalletProvider";
import { useAppState } from "@/app/state";
import { useStakingState } from "@/app/state/StakingState";

export function useComposedSignOptionsData() {
  const { publicKeyNoCoord } = useBTCWallet();
  const { networkInfo } = useAppState();
  const { formData } = useStakingState();

  const getSignPsbtOptions = useCallback(
    (signingStep?: SigningStep): SignPsbtOptions => {
      const latestNetworkParams =
        networkInfo?.params?.bbnStakingParams?.latestParam;

      const params: Record<string, string | number | string[] | number[]> = {
        stakerPk: publicKeyNoCoord,
        magicBytes: "62627434", // TODO remove once not needed from Unisat side
      };

      // Logic is explicit but easier to read
      if (signingStep !== undefined) {
        params.type = signingStep;
      }

      if (formData?.finalityProvider) {
        params.finalityProviders = [formData.finalityProvider];
      }

      if (formData?.term !== undefined) {
        params.stakingDuration = formData.term;
      }

      if (latestNetworkParams) {
        if (latestNetworkParams.covenantNoCoordPks) {
          params.covenantPks = latestNetworkParams.covenantNoCoordPks;
        }

        if (latestNetworkParams.covenantQuorum !== undefined) {
          params.covenantThreshold = latestNetworkParams.covenantQuorum;
        }

        if (latestNetworkParams.unbondingTime !== undefined) {
          params.minUnbondingTime = latestNetworkParams.unbondingTime;
        }
      }

      const options: SignPsbtOptions = {
        contracts: [
          {
            id: "babylon:staking",
            params,
          },
        ],
      };

      return options;
    },
    [networkInfo, formData, publicKeyNoCoord],
  );

  return {
    getSignPsbtOptions,
  };
}
