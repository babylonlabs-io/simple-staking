import { Form } from "@babylonlabs-io/bbn-core-ui";

import { Section } from "@/app/components/Section/Section";
import { useStakingService } from "@/app/hooks/services/useStakingService";
import { useStakingState } from "@/app/state/StakingState";
import { DelegationForm } from "@/components/staking/StakingForm";
import { StakingModal } from "@/components/staking/StakingModal";
import { getNetworkConfigBTC } from "@/config/network/btc";

import { FinalityProviders } from "./FinalityProviders/FinalityProviders";

const { networkName } = getNetworkConfigBTC();

export function StakingForm() {
  const { loading, validationSchema, stakingInfo, hasError, errorMessage } =
    useStakingState();
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
          <div className="lg:w-3/5 xl:w-2/3 p-6 rounded border bg-secondary-contrast border-primary-light/20">
            <FinalityProviders />
          </div>

          <div className="flex lg:w-2/5 xl:w-1/3 p-6 rounded border bg-secondary-contrast border-primary-light/20">
            <DelegationForm
              loading={loading}
              disabled={hasError}
              stakingInfo={stakingInfo}
              error={errorMessage}
            />
          </div>
        </div>

        <StakingModal />
      </Form>
    </Section>
  );
}
