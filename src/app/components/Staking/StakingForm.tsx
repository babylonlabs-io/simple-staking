import { Form, Heading } from "@babylonlabs-io/bbn-core-ui";

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
    <div className="card flex flex-col gap-2 py-4 lg:flex-1">
      <Heading
        variant="h4"
        className="text-primary-dark md:text-4xl capitalize"
      >
        {networkName} Staking
      </Heading>

      <Form
        className="flex flex-col gap-6 lg:flex-row"
        schema={validationSchema}
        mode="onChange"
        reValidateMode="onChange"
        onSubmit={displayPreview}
      >
        <div className="flex flex-col gap-4 lg:basis-3/5 xl:basis-2/3 p-6 rounded border bg-secondary-contrast border-primary-light/20">
          <FinalityProviders />
        </div>

        <div className="flex flex-col gap-4 lg:basis-2/5 xl:basis-1/3 p-6 rounded border bg-secondary-contrast border-primary-light/20">
          <DelegationForm
            loading={loading}
            disabled={hasError}
            stakingInfo={stakingInfo}
            error={errorMessage}
          />
        </div>

        <StakingModal />
      </Form>
    </div>
  );
}
