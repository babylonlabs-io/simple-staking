import { Text } from "@babylonlabs-io/bbn-core-ui";
import { useState } from "react";
import { IoMdClose } from "react-icons/io";
import { PiWarningOctagonFill } from "react-icons/pi";

interface Props {}

export const Banner = ({}: Props) => {
  const [show, setShow] = useState(true);

  if (!show) {
    return null;
  }

  return (
    <div className="flex flex-row gap-2 px-4 py-3 bg-[#D5FCE8] text-primary-main items-center justify-between">
      <div className="flex flex-row gap-2 items-center">
        <PiWarningOctagonFill />
        <Text variant="body1">
          Phase 2 is here! The second phase of Babylon mainnet has been
          launched.
          <a className="text-secondary-main"> Learn more</a>
        </Text>
      </div>
      <button
        className="border border-primary-light rounded-sm text-primary-light"
        onClick={() => setShow(false)}
      >
        <IoMdClose size={24} />
      </button>
    </div>
  );
};
