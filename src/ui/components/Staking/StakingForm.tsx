import { Card, Form } from "@babylonlabs-io/core-ui";

import { Section } from "@/ui/components/Section/Section";
import { DelegationForm } from "@/ui/components/Staking/DelegationForm";
import { StakingModal } from "@/ui/components/Staking/StakingModal";
import { getNetworkConfigBTC } from "@/ui/config/network/btc";
import { useStakingService } from "@/ui/hooks/services/useStakingService";
import { useStakingState } from "@/ui/state/StakingState";

import { FinalityProviders } from "./FinalityProviders/FinalityProviders";

const { networkName } = getNetworkConfigBTC();

export function StakingForm() {
  const {
    loading,
    validationSchema,
    stakingInfo,
    hasError,
    blocked,
    disabled,
    errorMessage,
  } = useStakingState();
  const { displayPreview } = useStakingService();

  return (
    <Section title={`${networkName} Staking`}>
      <Form
        schema={validationSchema}
        mode="onChange"
        reValidateMode="onChange"
        onSubmit={displayPreview}
      >
        <div className="flex flex-col gap-6 lg:flex-row">
          <Card className="flex-1 min-w-0">
            <FinalityProviders />
          </Card>

          <Card className="flex lg:w-2/5 xl:w-1/3">
            <DelegationForm
              loading={loading}
              blocked={blocked}
              disabled={disabled}
              hasError={hasError}
              error={errorMessage}
              stakingInfo={stakingInfo}
            />
          </Card>
        </div>

        <StakingModal />
      </Form>
    </Section>
  );
}
