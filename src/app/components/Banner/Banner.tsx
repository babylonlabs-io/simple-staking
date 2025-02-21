import { Text } from "@babylonlabs-io/bbn-core-ui";
import { PiWarningOctagonFill } from "react-icons/pi";

import { shouldDisplayTestingMsg } from "@/config";

interface Props {}

export const Banner = ({}: Props) => {
  if (!shouldDisplayTestingMsg()) {
    return null;
  }

  return (
    <div className="flex flex-row gap-2 px-4 py-3 bg-[#D5FCE8] text-primary-main items-center justify-between">
      <div className="flex flex-row gap-2 items-center">
        <PiWarningOctagonFill />
        <Text variant="body1">
          <strong>This is a testing app</strong>
          <br />
          The app may contain bugs. Use it after conducting your own research
          and making an informed decision. Tokens are for testing only and do
          not carry any monetary value and the testnet is not incentivized.
        </Text>
      </div>
    </div>
  );
};
