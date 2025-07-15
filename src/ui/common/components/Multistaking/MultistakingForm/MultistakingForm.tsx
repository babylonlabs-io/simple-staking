import { Form, HiddenField } from "@babylonlabs-io/core-ui";
import { useCallback } from "react";

import {
  AmountSubsection,
  AuthGuard,
  FinalityProviderField,
  SubmitButton,
} from "@/ui/common/components/Common";
import { FeesSection } from "@/ui/common/components/Multistaking/MultistakingForm/FeesSection";
import { MultistakingModal } from "@/ui/common/components/Multistaking/MultistakingModal/MultistakingModal";
import { getNetworkConfigBTC } from "@/ui/common/config/network/btc";
import { useBTCWallet } from "@/ui/common/context/wallet/BTCWalletProvider";
import { usePrice } from "@/ui/common/hooks/client/api/usePrices";
import { useBalanceState } from "@/ui/common/state/BalanceState";
import { useFinalityProviderBsnState } from "@/ui/common/state/FinalityProviderBsnState";
import {
  useMultistakingState,
  type MultistakingFormFields,
} from "@/ui/common/state/MultistakingState";
import { StakingStep, useStakingState } from "@/ui/common/state/StakingState";
import { satoshiToBtc } from "@/ui/common/utils/btc";
import FeatureFlagService from "@/ui/common/utils/FeatureFlagService";

import { ConnectButton } from "./ConnectButton";
import { FormAlert } from "./FormAlert";

export function MultistakingForm() {
  const { address } = useBTCWallet();
  const {
    stakingInfo,
    setFormData,
    goToStep,
    blocked: isGeoBlocked,
    errorMessage: geoBlockMessage,
  } = useStakingState();
  const { validationSchema, maxFinalityProviders } = useMultistakingState();

  const {
    icon: btcIcon,
    name: btcName,
    coinSymbol,
    displayUSD,
  } = getNetworkConfigBTC();

  const { bsnList, bsnLoading } = useFinalityProviderBsnState();
  const { stakableBtcBalance } = useBalanceState();
  const btcInUsd = usePrice(coinSymbol);
  const formattedBalance = satoshiToBtc(stakableBtcBalance);

  const handlePreview = useCallback(
    (formValues: MultistakingFormFields) => {
      setFormData({
        finalityProviders: Object.values(formValues.finalityProviders),
        term: Number(formValues.term),
        amount: Number(formValues.amount),
        feeRate: Number(formValues.feeRate),
        feeAmount: Number(formValues.feeAmount),
      });

      goToStep(StakingStep.PREVIEW);
    },
    [setFormData, goToStep],
  );

  if (!stakingInfo) {
    return null;
  }

  return (
    <Form
      schema={validationSchema}
      mode="onChange"
      reValidateMode="onChange"
      onSubmit={handlePreview}
    >
      {stakingInfo && (
        <HiddenField
          name="term"
          defaultValue={stakingInfo?.defaultStakingTimeBlocks?.toString()}
        />
      )}
      <HiddenField name="feeRate" defaultValue="0" />
      <HiddenField name="feeAmount" defaultValue="0" />
      <div className="flex flex-col gap-2">
        <FinalityProviderField
          max={FeatureFlagService.IsPhase3Enabled ? maxFinalityProviders : 1}
          bsns={bsnList}
          loading={bsnLoading}
        />
        <AmountSubsection
          fieldName="amount"
          currencyIcon={btcIcon}
          currencyName={btcName}
          balanceDetails={{
            balance: formattedBalance,
            symbol: coinSymbol,
            price: btcInUsd,
            displayUSD: displayUSD,
          }}
        />
        <FeesSection />

        <AuthGuard fallback={<ConnectButton />}>
          <SubmitButton />
        </AuthGuard>

        <FormAlert
          address={address}
          isGeoBlocked={isGeoBlocked}
          geoBlockMessage={geoBlockMessage}
        />
      </div>

      <MultistakingModal />
    </Form>
  );
}
