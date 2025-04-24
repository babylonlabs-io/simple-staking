import { Card, Form, useFormContext } from "@babylonlabs-io/core-ui";
import { useEffect } from "react";

import { Activity } from "@/app/components/Delegations/Activity";
import { useStakingService } from "@/app/hooks/services/useStakingService";
import { useStakingState } from "@/app/state/StakingState";
import { AuthGuard } from "@/components/common/AuthGuard";
import { DelegationForm } from "@/components/staking/StakingForm";
import { StakingModal } from "@/components/staking/StakingModal";
import { getNetworkConfigBTC } from "@/config/network/btc";
import { PromptBox } from "@/ui";

const { networkName } = getNetworkConfigBTC();

function FinalityProviderAutoSelector() {
  const { setValue } = useFormContext();

  useEffect(() => {
    setValue("finalityProvider", process.env.NEXT_PUBLIC_FINALITY_PROVIDER_PK, {
      shouldValidate: true,
      shouldTouch: true,
      shouldDirty: true,
    });
  }, [setValue]);

  return null;
}

export function StakingForm() {
  const {
    loading,
    validationSchema,
    stakingInfo,
    hasError,
    blocked,
    available,
    disabled,
    errorMessage,
  } = useStakingState();
  const { displayPreview } = useStakingService();

  return (
    <Form
      schema={validationSchema}
      mode="onChange"
      reValidateMode="onChange"
      onSubmit={displayPreview}
    >
      <FinalityProviderAutoSelector />
      <AuthGuard
        fallback={
          <div className="flex flex-col mx-4 items-center justify-center">
            <PromptBox className="py-[10vh]">
              <DelegationForm
                loading={loading}
                available={available}
                blocked={blocked}
                disabled={disabled}
                hasError={hasError}
                error={errorMessage}
                stakingInfo={stakingInfo}
              />
            </PromptBox>
          </div>
        }
      >
        <div className="flex flex-col gap-6 lg:flex-row mx-4 justify-center">
          <div className="flex-1 min-w-0 h-fit">
            <Activity />
          </div>
          <Card className="flex lg:w-2/5 xl:w-1/3 h-fit">
            <DelegationForm
              loading={loading}
              available={available}
              blocked={blocked}
              disabled={disabled}
              hasError={hasError}
              error={errorMessage}
              stakingInfo={stakingInfo}
            />
          </Card>
        </div>
      </AuthGuard>

      <StakingModal />
    </Form>
  );
}
