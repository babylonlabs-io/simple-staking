import { Text } from "@babylonlabs-io/bbn-core-ui";

import { useNetworkInfo } from "@/app/hooks/client/api/useNetworkInfo";
import { getNetworkConfig } from "@/config/network.config";
import { satoshiToBtc } from "@/utils/btc";
import { maxDecimals } from "@/utils/maxDecimals";
import { blocksToDisplayTime } from "@/utils/time";

import { ConfirmationModal } from "./ConfirmationModal";

interface UnbondModalProps {
  processing: boolean;
  open: boolean;
  onClose: () => void;
  onSubmit: () => void;
}
const { networkName, coinName } = getNetworkConfig();

export const UnbondModal = ({
  open,
  onClose,
  onSubmit,
  processing,
}: UnbondModalProps) => {
  const { data: networkInfo } = useNetworkInfo();
  const unbondingTime = blocksToDisplayTime(
    networkInfo?.params.bbnStakingParams?.latestParam?.unbondingTime,
  );
  const unbondingFeeBtc = maxDecimals(
    satoshiToBtc(
      networkInfo?.params.bbnStakingParams?.latestParam?.unbondingFeeSat ?? 0,
    ),
    8,
  );

  return (
    <ConfirmationModal
      title="Unbonding"
      processing={processing}
      open={open}
      onClose={onClose}
      onSubmit={onSubmit}
    >
      <Text variant="body1" className="pb-8 pt-4">
        You are about to unbond your stake before its expiration. A transaction
        fee of {unbondingFeeBtc} {coinName} will be deduced from your stake by
        the {networkName} network.
        <br />
        <br />
        The expected unbonding time will be about {unbondingTime}. After
        unbonded, you will need to use this dashboard to withdraw your stake for
        it to appear in your wallet.
      </Text>
    </ConfirmationModal>
  );
};
