import { Avatar, Button, SubSection, Text } from "@babylonlabs-io/core-ui";

import { getNetworkConfigBBN } from "@/ui/common/config/network/bbn";

const { logo, coinSymbol } = getNetworkConfigBBN();

interface RewardCardProps {
  validatorName: string;
  validatorAddress: string;
  amountBaby: number;
  amountUsd?: string;
  onClaim: () => void;
  disabled?: boolean;
}

export function RewardCard({
  validatorName,
  validatorAddress,
  amountBaby,
  amountUsd = "",
  onClaim,
  disabled = false,
}: RewardCardProps) {
  return (
    <SubSection className="flex-col gap-4">
      <div className="flex justify-between items-center w-full">
        <div className="inline-flex gap-2 items-center">
          <Avatar size="medium" url={logo} alt="BABY" />
          <span className="text-base sm:text-lg font-medium text-accent-primary">
            {validatorName}
          </span>
        </div>

        <Button size="small" onClick={onClaim} disabled={disabled}>
          Claim
        </Button>
      </div>

      <Text
        as="div"
        variant="body2"
        className="flex justify-between items-center text-accent-secondary"
      >
        <span>{validatorAddress.slice(0, 10)}…</span>
        <span>
          {amountBaby} {coinSymbol}
          {amountUsd ? ` • ${amountUsd}` : ""}
        </span>
      </Text>

      <Button fluid onClick={onClaim} disabled={disabled}>
        Claim
      </Button>
    </SubSection>
  );
}
