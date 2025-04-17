import { Form } from "@babylonlabs-io/core-ui";

import { useStakingService } from "@/app/hooks/services/useStakingService";
import { useStakingState } from "@/app/state/StakingState";
import { DelegationForm } from "@/components/staking/StakingForm";
import { StakingModal } from "@/components/staking/StakingModal";
import { getNetworkConfigBTC } from "@/config/network/btc";

import { FinalityProviders } from "./FinalityProviders/FinalityProviders";

const { networkName } = getNetworkConfigBTC();

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
    <div>
      <Form
        schema={validationSchema}
        mode="onChange"
        reValidateMode="onChange"
        onSubmit={displayPreview}
      >
        <div className="flex flex-col gap-6 lg:flex-row">
          <div className="flex-1 min-w-0">
            <FinalityProviders />
          </div>

          <div
            className="flex lg:w-2/5 xl:w-1/3"
            style={{
              borderLeft: "1px solid",
              borderImage:
                "linear-gradient(180deg, #040403 0%, #887957 44.23%, #060504 100%) 1",
            }}
          >
            <DelegationForm
              loading={loading}
              available={available}
              blocked={blocked}
              disabled={disabled}
              hasError={hasError}
              error={errorMessage}
              stakingInfo={stakingInfo}
            />
          </div>
        </div>

        <StakingModal />
      </Form>
    </div>
  );
}
