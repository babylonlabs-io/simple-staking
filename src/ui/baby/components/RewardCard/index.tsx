import { Avatar, Button, SubSection, Text } from "@babylonlabs-io/core-ui";

import { getNetworkConfigBBN } from "@/ui/common/config/network/bbn";

const { logo, coinSymbol } = getNetworkConfigBBN();

export function RewardCard() {
  return (
    <SubSection className="flex-col gap-4">
      <div className="flex justify-between items-center w-full">
        <div className="inline-flex gap-2 items-center">
          <Avatar size="medium" url={logo} alt="BABY" />
          <span className="text-base sm:text-lg font-medium text-accent-primary">
            {coinSymbol}
          </span>
        </div>

        <Button size="small">Claim</Button>
      </div>

      <Text
        as="div"
        variant="body2"
        className="flex justify-between items-center text-accent-secondary"
      >
        <span>Babylon Genesis</span>
        <span>$100.00 USD</span>
      </Text>

      <Button fluid>Claim</Button>
    </SubSection>
  );
}
